"""
Base SQS Lambda application
"""
from aws_lambda_powertools.utilities.data_classes import SQSEvent
from octo_aws_common.batch_application import BatchApplication


class SQSApplication(BatchApplication):
    """
    Base class for SQS Lambda applications
    """

    EVENT_TYPE = SQSEvent