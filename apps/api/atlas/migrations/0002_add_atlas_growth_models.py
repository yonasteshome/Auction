from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('atlas', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='VendorRiskProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('risk_factors', models.JSONField(blank=True, default=dict)),
                ('summary', models.TextField(blank=True, default='')),
                ('last_reviewed', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('vendor', models.ForeignKey(on_delete=models.CASCADE, related_name='risk_profiles', to='users.vendor')),
            ],
            options={
                'ordering': ['-last_reviewed'],
                'verbose_name': 'Vendor Risk Profile',
                'verbose_name_plural': 'Vendor Risk Profiles',
            },
        ),
        migrations.CreateModel(
            name='InventoryCycleReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_name', models.CharField(max_length=150)),
                ('opening_stock', models.PositiveIntegerField(default=0)),
                ('closing_stock', models.PositiveIntegerField(default=0)),
                ('units_sold', models.PositiveIntegerField(default=0)),
                ('turnover_days', models.PositiveIntegerField(default=0)),
                ('report_month', models.PositiveIntegerField()),
                ('report_year', models.PositiveIntegerField()),
                ('details', models.JSONField(blank=True, default=dict)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('vendor', models.ForeignKey(on_delete=models.CASCADE, related_name='inventory_reports', to='users.vendor')),
            ],
            options={
                'ordering': ['-report_year', '-report_month'],
                'verbose_name': 'Inventory Cycle Report',
                'verbose_name_plural': 'Inventory Cycle Reports',
            },
        ),
        migrations.CreateModel(
            name='PaymentReconciliationBatch',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('batch_reference', models.CharField(max_length=120, unique=True)),
                ('expected_amount', models.DecimalField(decimal_places=2, max_digits=14)),
                ('actual_amount', models.DecimalField(decimal_places=2, max_digits=14)),
                ('variance', models.DecimalField(decimal_places=2, max_digits=14)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('matched', 'Matched'), ('flagged', 'Flagged'), ('reconciled', 'Reconciled')], default='pending', max_length=20)),
                ('reconciled_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('vendor', models.ForeignKey(on_delete=models.CASCADE, related_name='reconciliation_batches', to='users.vendor')),
            ],
            options={
                'ordering': ['-created_at'],
                'verbose_name': 'Payment Reconciliation Batch',
                'verbose_name_plural': 'Payment Reconciliation Batches',
            },
        ),
        migrations.CreateModel(
            name='MarketplaceBenchmark',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_name', models.CharField(max_length=150)),
                ('city', models.CharField(blank=True, default='', max_length=120)),
                ('benchmark_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('price_index', models.DecimalField(decimal_places=4, default=0, max_digits=7)),
                ('source', models.CharField(default='market-data', max_length=80)),
                ('comparison_label', models.CharField(blank=True, default='', max_length=120)),
                ('generated_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-generated_at'],
                'verbose_name': 'Marketplace Benchmark',
                'verbose_name_plural': 'Marketplace Benchmarks',
            },
        ),
        migrations.CreateModel(
            name='ComplianceAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('alert_type', models.CharField(choices=[('payment', 'Payment Compliance'), ('listing', 'Listing Compliance'), ('delivery', 'Delivery Commitments'), ('license', 'License / Documentation'), ('safety', 'Product Safety')], default='payment', max_length=20)),
                ('severity', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], default='medium', max_length=20)),
                ('message', models.TextField()),
                ('resolved', models.BooleanField(default=False)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('vendor', models.ForeignKey(on_delete=models.CASCADE, related_name='compliance_alerts', to='users.vendor')),
            ],
            options={
                'ordering': ['-created_at'],
                'verbose_name': 'Compliance Alert',
                'verbose_name_plural': 'Compliance Alerts',
            },
        ),
        migrations.CreateModel(
            name='DynamicPriceRule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('item_name', models.CharField(max_length=150)),
                ('min_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('max_price', models.DecimalField(decimal_places=2, max_digits=12)),
                ('elasticity_factor', models.DecimalField(decimal_places=2, default=1.0, max_digits=5)),
                ('is_active', models.BooleanField(default=True)),
                ('notes', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('vendor', models.ForeignKey(on_delete=models.CASCADE, related_name='price_rules', to='users.vendor')),
            ],
            options={
                'ordering': ['-updated_at'],
                'verbose_name': 'Dynamic Price Rule',
                'verbose_name_plural': 'Dynamic Price Rules',
            },
        ),
        migrations.CreateModel(
            name='DeliveryPromise',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('transaction_reference', models.CharField(blank=True, default='', max_length=120)),
                ('promise_window', models.CharField(max_length=120)),
                ('confidence_score', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('delay_risk', models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ('summary', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('vendor', models.ForeignKey(on_delete=models.CASCADE, related_name='delivery_promises', to='users.vendor')),
            ],
            options={
                'ordering': ['-created_at'],
                'verbose_name': 'Delivery Promise',
                'verbose_name_plural': 'Delivery Promises',
            },
        ),
    ]
