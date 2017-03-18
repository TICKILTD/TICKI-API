# Ticki API

## Chargify Integration

### Testing Webhooks

Testing web hooks has typically been quite tricky, because the public service which initiates the web hook request cannot usually see your local machine (while you are developing your code). To fix this it is necessary to setup an intermediary. 

This is how it works:

 * First you register with the public intermediary service and get a public url that you can us with the provider that will be initiating the web hook POST

 * Next you run an application locally that monitors the public url, and replays any message received there to a local url.

What happens in this instance is the POST from Chargify will effectively be held in a cache at the intermediaries public service, and the local usility which replayed the request poles this cache. Upon noticing that a message is available, it downloads it, re-posts it to your local address and relays whatever response the local service responds with back to the public url owned by the intermediary and then on to chargify.

The best application for this is a RUBY GEM called ultrahook. To install this on your local machine you will need the RUBY runtime and GEM installer.

#### Installing Ruby and GEM
 * Download and install Ruby from here: http://rubyinstaller.org/downloads/

 * You should now see that you have a ruby folder in your root and inside its bin folder there is the gem exe. You can run gem from this location or simply create a system path to it so that it is available to you everywhere.

#### Installing Ultrahook

Instructions on how to download ultrahook are available on their site her: http://www.ultrahook.com

Essentially you need to use gem as you would npm or nuget. 

 * c:\Ruby23\bin\gem install ultrahook

note: Your version of ruby may be different (i.e. not 23)

#### Running Ultrahook

Navigate to your ruby23/bin folder and type the following:

```
ultrahook -k ft1XVcau0bCHP3Hib4GYcul3tOC0CTbK stripe http://localhost:8080/api
```

If this worked you should then see the following

``` 
Authenticated as ticki
Forwarding activated...
http://ticki.ticki.ultrahook.com -> http://localhost:8080/api
```

From now on, while this application is runnin any POST made to http://stripe.ticki.ultrahook.com/chargify/subscription/status will be redirected to http://localhost:8080/api/chargify/subscription/status

You can test the webhooks on the chargify dashboard. 

When they are executed, assuming you have the Ticki-API running you will see confirmation on the same command line where you ran the Ultrahook utility that an incomming request has been made:

```
Authenticated as ticki
Forwarding activated...
http://stripe.ticki.ultrahook.com -> http://localhost:8080/api
[2017-03-18 12:16:10] POST http://localhost:8080/api/chargify/subscription/status - 200
```


A video of this in action can be found here http://youtu.be/x_6xXO0-5vI?hd=1

