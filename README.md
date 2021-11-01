# Cloud-Octo

## Goal

* Simple event-driven system built using native AWS services.

## Decision Log 

### 28/10/2021

* Apigateway Service that is the central entrypoint for all backend requests
    - manages caching
    - rate limiting
    - authentication and authorization
    - forwarding messages onto queues for further processing
    - polls for read requests

---

* Admin UI
    - administrators create menus 
    - admins can take orders and complete them

---

#### When to use Queues vs Event Bus, vs Topics vs Streams

* Queues vs Bus's vs Topics vs Streams
* Queues for single consumer bursty traffic and good for traversing a single bounded context
* Event bus for message coordination and filtering and forwarding based
* Topics for fan out and predictable non-bursty load
* Queues here will be used for inter-context traversal and event bus for coordination communication inside boundaries

### 01/11/2021

* Business Service
    - Lambdas SQS integration makes this a sensible choice
    - Lambdas as compute engine for all events


## Reading

* https://github.com/awslabs/aws-lambda-powertools-python