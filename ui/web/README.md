## Design

We have a HTTP layer that handles API calls to a backend. 
We have a server state layer using SWR to handle server state and cache.
We have a client side state layer using zustand that stores objects in localstorage to avoid prop-drilling.

