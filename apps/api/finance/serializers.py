from rest_framework import serializers

from .models import Budget, BudgetCategory, Expense


class BudgetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetCategory
        fields = ('id', 'category_name', 'limit_amount')
        read_only_fields = ('id',)


class BudgetSerializer(serializers.ModelSerializer):
    categories = BudgetCategorySerializer(many=True, required=False)

    class Meta:
        model = Budget
        fields = ('id', 'month', 'year', 'total_limit', 'categories', 'created_at')
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        categories_data = validated_data.pop('categories', [])
        user = self.context['request'].user
        budget = Budget.objects.create(user=user, **validated_data)
        for c in categories_data:
            BudgetCategory.objects.create(budget=budget, **c)
        return budget

    def update(self, instance, validated_data):
        categories_data = validated_data.pop('categories', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if categories_data is not None:
            instance.categories.all().delete()
            for c in categories_data:
                BudgetCategory.objects.create(budget=instance, **c)
        return instance


class ExpenseSerializer(serializers.ModelSerializer):
    description = serializers.CharField(source='note', required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Expense
        fields = (
            'id', 'category', 'amount', 'date', 'description',
            'item', 'vendor', 'payment_method', 'receipt',
        )
        read_only_fields = ('id',)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
