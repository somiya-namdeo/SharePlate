import pandas as pd
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from supabase import Client
from collections import Counter
from app.schemas.analytics_schema import (
    AnalyticsResponse, FilterState, AvailableFilters, KPIs, KPIData,
    TimeSeriesPoint, CategoryDistribution, SafetyDistribution,
    UrgencyDistribution, CityRequest, OperationalInsights
)

class AnalyticsService:
    def __init__(self, db: Client):
        self.db = db

    def get_analytics_dashboard(self, period: str = '30d', city: Optional[str] = None, category: Optional[str] = None) -> AnalyticsResponse:
        # 1. Parse date bounds
        now = datetime.utcnow()
        days_map = {'7d': 7, '30d': 30, '90d': 90}
        days = days_map.get(period)

        current_start = None
        previous_start = None
        previous_end = None

        if days:
            current_start = now - timedelta(days=days)
            previous_end = current_start
            previous_start = previous_end - timedelta(days=days)

        # 2. Fetch all raw data (we filter locally to allow trend calculation in one pass if needed, but Supabase can filter too)
        # We will fetch EVERYTHING and filter in pandas to calculate both current and previous periods easily.
        # This is safe for MVP data volumes.

        donations_res = self.db.table("donations").select("*").execute().data or []
        requests_res = self.db.table("ngo_requests").select("*").execute().data or []
        matches_res = self.db.table("matches").select("*").execute().data or []
        profiles_res = self.db.table("profiles").select("*").execute().data or []

        df_donations = pd.DataFrame(donations_res)
        df_requests = pd.DataFrame(requests_res)
        df_matches = pd.DataFrame(matches_res)
        df_profiles = pd.DataFrame(profiles_res)

        # Ensure datetimes
        for df in [df_donations, df_requests, df_matches]:
            if not df.empty and 'created_at' in df.columns:
                df['created_at'] = pd.to_datetime(df['created_at'], errors='coerce', utc=True)

        # Link profiles city to requests
        if not df_requests.empty:
            def extract_city(address):
                if pd.isna(address) or not isinstance(address, str) or not address.strip():
                    return None
                clean_addr = address.strip().rstrip('.')
                parts = [p.strip() for p in clean_addr.split(',') if p.strip()]
                if len(parts) >= 3:
                    return parts[-2].title()
                elif len(parts) == 2:
                    return parts[0].title()
                elif len(parts) == 1:
                    return parts[0].title()
                return None

            if 'address' in df_requests.columns:
                df_requests['derived_city'] = df_requests['address'].apply(extract_city)
            else:
                df_requests['derived_city'] = None

            if not df_profiles.empty:
                df_requests = df_requests.merge(
                    df_profiles[['id', 'city']],
                    left_on='ngo_id', right_on='id',
                    how='left', suffixes=('', '_profile')
                )
            else:
                df_requests['city'] = None

            # Priority: derived_city -> profile city -> Unknown
            df_requests['city'] = df_requests['derived_city'].combine_first(df_requests['city']).fillna('Unknown')
        else:
            df_requests = pd.DataFrame(columns=['city'])

        # 2b. Normalize Data before filtering or aggregations
        if not df_donations.empty and 'safety_status' in df_donations.columns:
            df_donations['safety_status'] = (
                df_donations['safety_status']
                .fillna('Unknown')
                .astype(str)
                .str.strip()
                .str.title()
                .replace({
                    'Yes': 'Safe',
                    'No': 'Unsafe'
                })
            )

        if not df_donations.empty and 'food_category' in df_donations.columns:
            df_donations['food_category'] = (
                df_donations['food_category']
                .fillna('Unknown')
                .astype(str)
                .str.strip()
                .str.title()
                .replace({
                    'Cooked': 'Cooked Meal',
                    'Cooked Food': 'Cooked Meal'
                })
            )

        if not df_requests.empty and 'city' in df_requests.columns:
            df_requests['city'] = (
                df_requests['city']
                .fillna('Unknown')
                .astype(str)
                .str.strip()
                .replace({'': 'Unknown'})
            )

        # Available filters
        available_cities = sorted([c for c in (df_requests['city'].unique().tolist() if not df_requests.empty else []) if c and c != 'Unknown'])
        available_categories = sorted([c for c in (df_donations['food_category'].unique().tolist() if not df_donations.empty else []) if c])

        # 3. Apply Filters for Current Data
        def apply_filters(df, date_col, start_date, end_date):
            if df.empty: return df
            mask = pd.Series(True, index=df.index)
            if start_date:
                start_date = pd.to_datetime(start_date, utc=True)
                mask &= (df[date_col] >= start_date)
            if end_date:
                end_date = pd.to_datetime(end_date, utc=True)
                mask &= (df[date_col] < end_date)

            # City and Category filters are global context
            if city and 'city' in df.columns:
                mask &= (df['city'] == city)

            if category and 'food_category' in df.columns:
                mask &= (df['food_category'] == category)

            return df[mask]

        df_don_cur = apply_filters(df_donations, 'created_at', current_start, None)
        df_req_cur = apply_filters(df_requests, 'created_at', current_start, None)
        df_mat_cur = apply_filters(df_matches, 'created_at', current_start, None)

        df_don_prev = apply_filters(df_donations, 'created_at', previous_start, previous_end)
        df_req_prev = apply_filters(df_requests, 'created_at', previous_start, previous_end)
        df_mat_prev = apply_filters(df_matches, 'created_at', previous_start, previous_end)

        def calculate_kpis(d_don, d_req, d_mat):
            # 1. Successful Rescues
            completed_matches = d_mat[d_mat['status'] == 'completed'] if not d_mat.empty else pd.DataFrame()
            successful_rescues = len(completed_matches)

            # 2. Quantity Rescued (Sum quantity from donations linked to completed matches)
            quantity_rescued = 0.0
            if not completed_matches.empty and not d_don.empty:
                linked_donations = d_don[d_don['id'].isin(completed_matches['donation_id'].unique())]
                quantity_rescued = float(linked_donations['quantity'].sum())

            # 3. Meals Fulfilled (Sum meals from requests linked to completed matches)
            meals_fulfilled = 0
            if not completed_matches.empty and not d_req.empty:
                linked_reqs = d_req[d_req['id'].isin(completed_matches['request_id'].unique())]
                meals_fulfilled = int(linked_reqs['meals_needed'].sum())

            # 4. NGOs Served
            ngos_served = int(completed_matches['ngo_id'].nunique()) if not completed_matches.empty else 0

            # 5. Active Requests
            active_requests = len(d_req[d_req['status'] == 'open']) if not d_req.empty else 0

            # 6. Critical Resolved Percent
            if not d_req.empty:
                crit_reqs = d_req[d_req['urgency_level'].str.lower() == 'critical']
                crit_fulfilled = crit_reqs[crit_reqs['status'] == 'fulfilled']
                crit_percent = (len(crit_fulfilled) / len(crit_reqs) * 100) if len(crit_reqs) > 0 else 0.0
            else:
                crit_percent = 0.0

            return {
                'successful_rescues': successful_rescues,
                'quantity_rescued': quantity_rescued,
                'meals_fulfilled': meals_fulfilled,
                'ngos_served': ngos_served,
                'active_requests': active_requests,
                'critical_resolved_percent': crit_percent
            }

        kpi_cur = calculate_kpis(df_don_cur, df_req_cur, df_mat_cur)
        kpi_prev = calculate_kpis(df_don_prev, df_req_prev, df_mat_prev)

        def get_trend(cur, prev):
            if days is None or prev == 0:
                return None
            return round(((cur - prev) / prev) * 100, 1)

        kpis = KPIs(
            successful_rescues=KPIData(value=kpi_cur['successful_rescues'], trend_percent=get_trend(kpi_cur['successful_rescues'], kpi_prev['successful_rescues'])),
            quantity_rescued=KPIData(value=kpi_cur['quantity_rescued'], trend_percent=get_trend(kpi_cur['quantity_rescued'], kpi_prev['quantity_rescued']), unit="kg"),
            meals_fulfilled=KPIData(value=kpi_cur['meals_fulfilled'], trend_percent=get_trend(kpi_cur['meals_fulfilled'], kpi_prev['meals_fulfilled'])),
            ngos_served=KPIData(value=kpi_cur['ngos_served'], trend_percent=get_trend(kpi_cur['ngos_served'], kpi_prev['ngos_served'])),
            active_requests=KPIData(value=kpi_cur['active_requests'], trend_percent=get_trend(kpi_cur['active_requests'], kpi_prev['active_requests'])),
            critical_resolved_percent=KPIData(value=round(kpi_cur['critical_resolved_percent'], 1), trend_percent=get_trend(kpi_cur['critical_resolved_percent'], kpi_prev['critical_resolved_percent']))
        )

        # Charts: Donations Over Time
        ts_data = []
        if not df_don_cur.empty:
            df_don_cur['date_only'] = df_don_cur['created_at'].dt.date
            daily_counts = df_don_cur.groupby('date_only').size()
            for date_val, count in daily_counts.items():
                ts_data.append(TimeSeriesPoint(date=date_val.strftime('%Y-%m-%d'), count=int(count)))
        ts_data.sort(key=lambda x: x.date)

        # Charts: Food Categories
        cat_data = []
        if not df_don_cur.empty and 'food_category' in df_don_cur.columns:
            counts = df_don_cur[df_don_cur['food_category'] != 'Unknown']['food_category'].value_counts()
            total = counts.sum()
            if total > 0:
                for cat, count in counts.items():
                    if pd.notna(cat):
                        cat_data.append(CategoryDistribution(category=str(cat), count=int(count), percentage=round((count/total)*100, 1)))

        # Charts: Safety Distribution
        safe_data = []
        if not df_don_cur.empty and 'safety_status' in df_don_cur.columns:
            counts = df_don_cur[df_don_cur['safety_status'] != 'Unknown']['safety_status'].value_counts()
            total = counts.sum()
            if total > 0:
                for stat, count in counts.items():
                    if pd.notna(stat):
                        safe_data.append(SafetyDistribution(safety_status=str(stat), count=int(count), percentage=round((count/total)*100, 1)))

        # Charts: Urgency Distribution
        urg_data = []
        if not df_don_cur.empty and 'urgency_level' in df_don_cur.columns:
            counts = df_don_cur['urgency_level'].value_counts()
            for urg, count in counts.items():
                if pd.notna(urg):
                    urg_data.append(UrgencyDistribution(urgency_level=str(urg), count=int(count)))

        # Charts: Requests by City
        city_reqs = []
        if not df_req_cur.empty and 'city' in df_req_cur.columns:
            counts = df_req_cur['city'].value_counts()
            for c, count in counts.items():
                if pd.notna(c):
                    city_reqs.append(CityRequest(city=str(c), count=int(count)))
            # Keep top 10
            city_reqs = city_reqs[:10]

        # Operational Insights
        most_donated = df_don_cur['food_category'].mode()[0] if not df_don_cur.empty and 'food_category' in df_don_cur.columns and not df_don_cur['food_category'].dropna().empty else None

        valid_cities = df_req_cur[df_req_cur['city'] != 'Unknown'] if not df_req_cur.empty and 'city' in df_req_cur.columns else pd.DataFrame()
        highest_demand = valid_cities['city'].mode()[0] if not valid_cities.empty else None

        avg_shelf = round(float(df_don_cur['predicted_shelf_life'].mean()), 1) if not df_don_cur.empty and 'predicted_shelf_life' in df_don_cur.columns and not df_don_cur['predicted_shelf_life'].isna().all() else None

        rescue_comp_rate = None
        if not df_mat_cur.empty:
            comp_matches = len(df_mat_cur[df_mat_cur['status'] == 'completed'])
            rescue_comp_rate = round((comp_matches / len(df_mat_cur)) * 100, 1)

        uns_rate = None
        if not df_don_cur.empty and 'safety_status' in df_don_cur.columns:
            tested_don = df_don_cur[df_don_cur['safety_status'] != 'Unknown']
            tot_tested = len(tested_don)
            if tot_tested > 0:
                uns_don = len(tested_don[tested_don['safety_status'].str.lower() == 'unsafe'])
                uns_rate = round((uns_don / tot_tested) * 100, 1)

        ngo_ful_rate = None
        if not df_req_cur.empty:
            valid_reqs = df_req_cur[df_req_cur['status'].str.lower() != 'cancelled']
            if len(valid_reqs) > 0:
                ful_reqs = len(valid_reqs[valid_reqs['status'] == 'fulfilled'])
                ngo_ful_rate = round((ful_reqs / len(valid_reqs)) * 100, 1)

        crit_today = 0
        if not df_req_cur.empty:
            today_start = pd.to_datetime(now.date(), utc=True)
            crit_today = len(df_req_cur[(df_req_cur['urgency_level'].str.lower() == 'critical') & (df_req_cur['created_at'] >= today_start)])

        ops = OperationalInsights(
            most_donated_category=str(most_donated) if most_donated and most_donated != 'Unknown' else None,
            highest_demand_city=str(highest_demand) if highest_demand is not None else None,
            avg_shelf_life_hrs=avg_shelf,
            rescue_completion_rate_percent=rescue_comp_rate,
            unsafe_rate_percent=uns_rate,
            ngo_fulfillment_percent=ngo_ful_rate,
            critical_requests_today=crit_today
        )

        return AnalyticsResponse(
            filters=FilterState(period=period, city=city, category=category),
            available_filters=AvailableFilters(cities=available_cities, categories=available_categories),
            kpis=kpis,
            donations_over_time=ts_data,
            food_categories=cat_data,
            safety_distribution=safe_data,
            urgency_distribution=urg_data,
            requests_by_city=city_reqs,
            operational_insights=ops
        )
