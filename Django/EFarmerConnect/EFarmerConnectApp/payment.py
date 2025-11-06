import uuid
from django.conf import settings

class PaymentException(Exception):
    pass
class BasePaymentProvider:
    def charge(self, amount, phone_number, **kwargs):
        raise NotImplementedError()

    def refund(self, transaction_id, amount=None):
        raise NotImplementedError()

class TestPaymentProvider(BasePaymentProvider):
    def charge(self, amount, phone_number, **kwargs):
        # Simulate a successful payment
        transaction_id = f"test_{uuid.uuid4()}"
        return {
            'status': 'success',
            'transaction_id': transaction_id,
            'amount': amount,
            'provider': 'test'
        }

    def refund(self, transaction_id, amount=None):
        return {
            'status': 'success',
            'transaction_id': transaction_id,
            'refunded_amount': amount
        }

# Placeholder classes for real providers
class MTNPaymentProvider(BasePaymentProvider):
    def __init__(self, client_id, client_secret, shortcode):
        self.client_id = client_id
        self.client_secret = client_secret
        self.shortcode = shortcode

    def charge(self, amount, phone_number, **kwargs):
        # TODO: Implement MTN Mobile Money integration
        raise PaymentException('MTN integration not implemented yet')

    def refund(self, transaction_id, amount=None):
        raise PaymentException('MTN integration not implemented yet')

class AirtelPaymentProvider(BasePaymentProvider):
    def __init__(self, api_key, api_secret):
        self.api_key = api_key
        self.api_secret = api_secret

    def charge(self, amount, phone_number, **kwargs):
        # TODO: Implement Airtel Money integration
        raise PaymentException('Airtel integration not implemented yet')

    def refund(self, transaction_id, amount=None):
        raise PaymentException('Airtel integration not implemented yet')


def get_payment_provider():
    provider = getattr(settings, 'PAYMENT_PROVIDER', 'test')
    providers = getattr(settings, 'PAYMENT_PROVIDERS', {})
    if provider == 'test' or getattr(settings, 'PAYMENT_TEST_MODE', True):
        return TestPaymentProvider()
    if provider == 'mtn':
        cfg = providers.get('mtn', {})
        return MTNPaymentProvider(cfg.get('client_id'), cfg.get('client_secret'), cfg.get('shortcode'))
    if provider == 'airtel':
        cfg = providers.get('airtel', {})
        return AirtelPaymentProvider(cfg.get('api_key'), cfg.get('api_secret'))
    raise PaymentException('Unknown payment provider')
