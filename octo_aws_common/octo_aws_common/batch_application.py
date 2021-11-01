"""
Base batch Lambda application
"""
from abc import abstractmethod

from octo_aws_common.lambda_application import LambdaApplication


class BatchApplication(LambdaApplication):
    """
    Base class for Batch Lambda applications
    """

    def __init__(self):
        super().__init__()
        self.records = None

    def initialise(self):
        """
        Application initialisation
        """
        self.records = getattr(self.event, "records", [])

    def start(self):
        """
        Start the application
        """
        for record in self.records:
            self.process_record(record)

    @abstractmethod
    def process_record(self, record):
        """
        Process a single record from the batch
        """