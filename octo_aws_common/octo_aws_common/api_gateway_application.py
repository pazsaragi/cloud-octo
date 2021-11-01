"""
Base API Gateway Lambda application
"""
from aws_lambda_powertools.utilities.data_classes import APIGatewayProxyEvent
from octo_aws_common.lambda_application import LambdaApplication


class APIGatewayApplication(LambdaApplication):
    """
    Base class for API Gateway Lambda applications
    """

    EVENT_TYPE = APIGatewayProxyEvent
