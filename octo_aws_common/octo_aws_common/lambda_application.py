"""
Module for common application functionality for Lambda functions
"""
from aws_lambda_powertools.utilities.data_classes.common import DictWrapper


class LambdaApplication:
    """
    Base class for Lambda applications
    """

    # Base class will always return event in same format
    EVENT_TYPE = DictWrapper

    def __init__(self):
        self.context = None
        self.event = None

    def main(self, event, context):
        """
        Common entry point behaviour
        """
        self.response = {"message": "Lambda application stopped"}
        self.context = context
        return self.process_event(event)

    def process_event(self, event):
        """
        Processes event object passed in by Lambda service
        Can be overridden to customise event parsing
        """
        return self.EVENT_TYPE(event)


def overrides(base_class):
    """
    Decorator used to specify that a method overrides a base class method
    """

    def decorate(method):
        """
        Override assertion
        """
        assert method.__name__ in dir(base_class)
        return method

    return decorate
