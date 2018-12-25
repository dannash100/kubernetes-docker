# kubernetes-docker
kubernetes and docker notes and exercises following *Kubernetes in Action* Marko Luksa (Manning) 2017

define aliases to make life easier in ```~/.bash_profile``` by adding ```alias alias_name=full_command```

## docker

### create new container

from directory with Dockerfile
```docker build -t container_name```

### commands

- ```images```: list locally stored images
- ```inspect container_name```: JSON with info
- ```exec -it container_name bash```: running shell inside container. -it: STDIN open, pusedo terminal.
- ```ps```: list running containers
- ```stop``` and ```rm container_name```: stop and remove container.
- ```run -p 8080:8080 -d user/container_name```: run an image on a different machine on port 8080

### pushing to image registry
- ```docker tag image_name user/image_name```
- ```docker push user/image_name```

## kubernetes
```alias k=kubectl```

### creating simple kubernetes cluster with minikube

```minikube start```: sets up a single-node cluster for use in testing kubernetes and developing apps locally
```minikube dashboard```: open GUI

### YAML descriptors
define kubernetes objects from YAML files.
```kubectl get pod pod_name -o yaml``` to view YAML of a deployed pod

- view guide template for creating manifests from scratch use explain: ```kubectl explain pods[.spec]```
- create from YAML or JSON: ```kubectl create -f pod_name.yaml```

**example of a basic pod manifest** ```pod_name.yaml```
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: kubia-manual
spec:
  containers:
  - image: luksa/kubia
    name: kubia
    ports:
    - containerPort: 8080
      protocol: TCP
```

port definition can be omitted as is purely informational.

### pods

- A group of related containers that will always run concurrently on the same worker node and in the same namespace. Each pod has its own IP, hostname, processes.
- pods allow for containers inside each group to share certain resources but not all, to achieve this Docker is configured to have all containers of a pod share the same set of Linux namespaces (shared hostname, network interfaces and IPC).
- containers in pods must make sure to not have port conflicts as they share a common port space.
- containers within pods can communicate through localhost
- communicate between separate pods and worker nodes with NAT-less network using the pods routable IP address
- pods are lightweight so dispersing apps into multiple pods is preferable, each one should contain only tightly related processes.
- example structure of a pod with a main container and supporting containers "the main container in a pod could be a web server that serves files from a certain file directory, while an additional container (a sidecar container) periodically downloads content from an external source and stores it in the web server’s directory."

### labels

- key-value pair you attach to a resource and then used when selecting resources using *label selectors*
example:
  - app: ui, which specifies which app, component, or microservice the pod belongs to.
  - rel: stable, which shows whether the application running in the pod is a stable, beta,
  or a canary release.
- defined in metadata portion of manifest
- can use multiple label selectors such as ```!label_name, label_name=val,```
- can use to categorize worker nodes using ```nodeSelector: condition: "true"``` part of the *spec* section deploy this pod only to nodes containing condition label.

### namespace

- ```get ns``` view ns in cluster
- see ```examples/custom-namespace.yaml``` then ```create -f``` it
- ```kubectl create -f pod_name.yaml -n custom-namespace``` to create into custom ns

### scheduling

- distributing pods between worker nodes.

### service object & replication controller

- rarely will you actually create pods directly, instead you create other resources such as RC's or deployments which create and manage the actual pods.
- service object solves problem of ever-changing IPs of pods as they are created and disappear. It also exposes multiple pods at a single consistent IP and port pair
- each pod has its own IP address but it is internal to the cluster and not accessible, it can be exposed through the service object.

**LoadBalancer-type service**: an external load balancer that you can use to connect to a pod through its public IP.

**replicationcontroller**: makes sure there is always one instance of your pod running. Used to replicate pods and keep them running. can define how many replicas is required. If a pod was to break or be removed, the controller will make a new one to replace it.

### commands

- ```expose rc image_name --type=LoadBalencer --name image_name-http```: rc = replicationcontroller. creates service object
- ```get services```: list service objects
- ```get rc```: list replicationcontrollers
- ```cluster-info```: display cluster and urls of kubernetes components
- ```ssh```: log into Minikube VM to explore processes running on the node
- ```logs pod_name [-c container_name]```: retrieve logs *note: logs are rotated daily, every time the file reaches 10MB in size*
- ```port-forward pod_name 8888:8080``` & then ```curl localhost:8888```: connect to pod with port forwarding for debug

**horizontal scaling**: ```scale rc image_name --replicas=3``` define desired pod instances

- ```get nodes```: list nodes
- ```get pods [-o wide]```: list pods, ?display IP and pods node
- ```describe [node | pod] [name]```: detailed information about single or all nodes. CPU and memory data, system information, containers running on the node and more.
- ```delete po [pod_name | -l label=val]``` delete pod by name or by label

## maintenance and VM health

### liveness probes

- check to see if containers are alive
- assigned to container and then Kubernetes will periodically execute the probe and restart the container if it needs to.
- **HTTP GET probe** performs GET request on containers IP, port, path.
- **TCP Socket probe** tries to open a TCP connection on the port of a container
- **Exec probe** executes a command inside container and checks the commands exit status code.
