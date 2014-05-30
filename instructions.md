Get started with homeguard
-----------------------------------

Welcome to Node JS Web Starter application that uses the IBM DataCache REST interface!

This sample application demonstrates how to write a Node JS application using IBM DataCache REST interface and deploy it on BlueMix.

1. [Install the cf command-line tool](https://www.ng.bluemix.net/docs/redirect.jsp?name=cf-instructions).
2. [Download the starter application package](https://ace.ng.bluemix.net:443/rest/../rest/apps/dc3141b1-aca2-43f5-88e0-65a35fde709a/starter-download)
3. Extract the package and cd to it.
4. Connect to BlueMix:

		cf api https://api.ng.bluemix.net

5. Log into BlueMix:

		cf login -u rafamelo.oliveira@gmail.com
		cf target -o rafamelo.oliveira@gmail.com -s dev
		
6. Deploy your app:

		cf push homeguard

7. Access your app: [http://homeguard.ng.bluemix.net](http://homeguard.ng.bluemix.net)
