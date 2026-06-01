#!/usr/bin/env bash
set -euo pipefail

git apply --whitespace=fix <<'PATCH'
--- a/apps/api/market/serializers.py
+++ b/apps/api/market/serializers.py
@@ -397,6 +397,22 @@ class PriceAlertSerializer(serializers.ModelSerializer):
             raise serializers.ValidationError("Target price must be a positive number.")
         return value
 
+    def validate(self, attrs):
+        request = self.context.get('request')
+        if request and request.user and request.user.is_authenticated:
+            item = attrs.get('item')
+            city = attrs.get('city', '')
+            if item and PriceAlert.objects.filter(
+                user=request.user,
+                item=item,
+                city=city,
+                is_active=True,
+            ).exists():
+                raise serializers.ValidationError(
+                    'You already have an active price alert for this item and city.'
+                )
+        return attrs
+
     def create(self, validated_data):
         validated_data['user'] = self.context['request'].user
         return super().create(validated_data)
PATCH

echo "Patch applied successfully"
