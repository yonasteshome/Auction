"""
Management command to train SARIMA model using seeded price data.
Run: python manage.py train_sarima_model
"""
import logging
from datetime import date, timedelta
from decimal import Decimal

import numpy as np
import pandas as pd
from django.core.management.base import BaseCommand
from statsmodels.tsa.statespace.sarimax import SARIMAX

from market.models import Forecast, ForecastRun, Item, PriceSubmission

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Train SARIMA model on existing price history'

    def add_arguments(self, parser):
        parser.add_argument(
            '--forecast-weeks',
            type=int,
            default=4,
            help='Number of weeks to forecast'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_LABEL('=== SARIMA Model Training ==='))
        
        weeks = options['forecast_weeks']
        rows_created = 0
        item_count = 0
        trained_items = []
        
        for item in Item.objects.all():
            # Gather historical data
            submissions = (
                PriceSubmission.objects.filter(item=item, status="approved")
                .order_by("date_observed")
                .values("date_observed", "price_value")
            )
            
            if len(submissions) < 10:  # SARIMA needs a minimum amount of data
                continue
            
            item_count += 1
            self.stdout.write(f'\n  Training {item.name} ({len(submissions)} submissions)...')
            
            try:
                df = pd.DataFrame(list(submissions))
                df['date_observed'] = pd.to_datetime(df['date_observed'])
                df.set_index('date_observed', inplace=True)
                # Re-sample to daily and interpolate to fill gaps for time series continuity
                df = df.resample('D').mean()
                df['price_value'] = df['price_value'].astype(float).interpolate(method='linear')

                # Basic SARIMA model: (p,d,q) x (P,D,Q,s)
                # s=7 for weekly seasonality if using daily data
                model = SARIMAX(
                    df['price_value'], 
                    order=(1, 1, 1), 
                    seasonal_order=(1, 1, 1, 7),
                    enforce_stationarity=False,
                    enforce_invertibility=False
                )
                results = model.fit(disp=False)
                
                # Predict
                forecast_res = results.get_forecast(steps=weeks * 7)
                forecast_mean = forecast_res.predicted_mean
                conf_int = forecast_res.conf_int()
                
                # Delete old forecasts for this item
                Forecast.objects.filter(item=item).delete()
                
                # Save weekly snapshots
                start_date = date.today()
                for i in range(1, weeks + 1):
                    target_date = start_date + timedelta(weeks=i)
                    # Get prediction closest to target date
                    pred_price = forecast_mean.iloc[min(i*7-1, len(forecast_mean)-1)]
                    low = conf_int.iloc[min(i*7-1, len(conf_int)-1), 0]
                    high = conf_int.iloc[min(i*7-1, len(conf_int)-1), 1]
                    
                    Forecast.objects.create(
                        item=item,
                        forecast_date=target_date,
                        predicted_price=Decimal(str(round(pred_price, 2))),
                        confidence_low=Decimal(str(round(low, 2))),
                        confidence_high=Decimal(str(round(high, 2))),
                        model_used="sarima_v1",
                        sarima_order="(1,1,1)",
                        seasonal_order="(1,1,1,7)",
                        mse=float(results.mse)
                    )
                    rows_created += 1
                    
                trained_items.append(item.name)
                self.stdout.write(self.style.SUCCESS(f'    ✓ {weeks} forecasts created (MSE: {results.mse:.4f})'))
                    
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'    ✗ Failed: {str(e)}'))
                logger.error(f"Failed to train SARIMA for item {item.name}: {str(e)}")
                continue

        # Create a ForecastRun record
        run = ForecastRun.objects.create(
            model_used="sarima_v1",
            status="success",
            item_count=item_count,
            detail={
                "rows_created": rows_created,
                "forecast_weeks": weeks,
                "trained_items": trained_items
            },
        )
        
        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Training Complete!\n'
            f'  - Items trained: {item_count}\n'
            f'  - Total forecasts created: {rows_created}\n'
            f'  - Run ID: {run.id}\n'
        ))
