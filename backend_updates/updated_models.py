from django.db import models

from orders.models import Order

from utils.payment import create_payment

from estores.models import EStore

from uuid import uuid4

from django.core.cache import cache



# First, define the PAYMENT_CHOICES if not already defined
PAYMENT_CHOICES = (
    ('pending', 'Pending'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ('refunded', 'Refunded'),
)

# NEW: Platform choices
PLATFORM_CHOICES = (
    ('web', 'Web'),
    ('mobile', 'Mobile'),
    ('api', 'API'),
)

# Add this updated Payment model
class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    estore = models.ForeignKey(EStore, on_delete=models.SET_NULL, null=True, blank=True, related_name="estore_payments")
    payment_method = models.CharField(
        max_length=50,
        default="pg"
    )  # pg (payment gateway) or cod
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=50,
        choices=PAYMENT_CHOICES,
        default='pending'
    )
    transaction_id = models.CharField(max_length=100, blank=True, null=True)  # merchant_order_id
    payment_date = models.DateTimeField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    # Additional fields
    payment_gateway = models.CharField(max_length=50, blank=True, null=True, default="PhonePe")
    payment_url = models.TextField(blank=True, null=True)
    
    # NEW: Platform-specific fields
    platform = models.CharField(
        max_length=20,
        choices=PLATFORM_CHOICES,
        default='web'
    )
    device_info = models.JSONField(
        blank=True, 
        null=True,
        help_text="Store device information for mobile payments"
    )
    
    def save(self, *args, **kwargs):
        if not self.pk:
            # BACKWARD COMPATIBILITY: Ensure platform defaults to 'web'
            if not self.platform:
                self.platform = 'web'
            
            merchant_order_id = str(uuid4())  # Generate unique order ID
            self.transaction_id = merchant_order_id  # Set transaction_id first
            
            if self.payment_method == "pg":
                # Generate platform-specific redirect URL (now with proper transaction_id)
                redirect_url = self.generate_redirect_url()
                merchant_order_id, standard_pay_response = create_payment(
                    amount=self.amount, 
                    estore=self.estore,
                    redirect_url=redirect_url
                )
                self.payment_url = standard_pay_response.redirect_url

        order = self.order
        order.payment_status = self.status  # Update the order status to match the payment status
        order.save()  # Save the updated

        cache_key = f"cache:/api/order/orders/?items_needed=true&user_id={self.order.user.id}&ordering=-id"
        cache.delete(cache_key)
        super().save(*args, **kwargs)

    def generate_redirect_url(self):
        """
        Generate platform-specific redirect URL
        """
        if self.platform == 'mobile':
            # For mobile apps, use deep link URL
            return f"naigaonmarketapp://payment?transaction_id={self.transaction_id or 'temp'}&order_id={self.order.id}"
        else:
            # For web, use traditional website URL
            base_url = getattr(self.estore, 'website_url', 'https://nm.thelearningsetu.in')
            return f"{base_url}/checkout/payment-success?transaction_id={self.transaction_id or 'temp'}&order_id={self.order.id}"

    class Meta:
        ordering = ['-created']
    
    def __str__(self):
        platform_str = f" ({self.platform})" if self.platform != 'web' else ""
        return f"Payment for Order #{self.order.id} - {self.amount}{platform_str}"

# Migration snippet for existing databases
"""
# Create a Django migration file with this content:

from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('payments', '0001_initial'),  # Replace with your latest migration
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='platform',
            field=models.CharField(
                choices=[('web', 'Web'), ('mobile', 'Mobile'), ('api', 'API')],
                default='web',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='payment',
            name='device_info',
            field=models.JSONField(
                blank=True,
                help_text='Store device information for mobile payments',
                null=True
            ),
        ),
    ]
"""
