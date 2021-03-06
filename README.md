# CalTech DevOps Capstone Project - Hangout Point

<br />

<i><strong>By:</strong> Brian Brown</i><br />
<i><strong>Date:</strong> September 11, 2021</i>

<br />

This project serves as the capstone project for the CalTech SimpliLearn post graduate DevOps program.

<br />

## Problem to Solve

An entertainment company like BookMyShow where users book their tickets have multiple users accessing their web app. Due to less infrastructure availability, they use less machines and provide the required structure. This method includes many weaknesses such as:

<ul>
    <li>Developers must wait till the complete software development for the test results.</li>
    <li>There is a huge possibility of bugs in the test results.</li>
    <li>Delivery process of the software is slow.</li>
    <li>The quality of software is a concern due to continuous feedback referring to things like coding or architectural issues, build failures, test conditions, and file release uploads.</li>
</ul>

The objective is to implement the automation of the build and release process for their product.

<br />

## Resolution Overview

The below implementation was chosen for simplicity and portability, and enables the solution to be deployed in a scalable environment.

### Tools Used

| Tool             | Version   | Purpose                                 |
|------------------|-----------|-----------------------------------------|
| Helm | v3.* | Kubernetes deployment tool for templating deployment artifacts and deploying them to a Kubernetes cluster. While this isn’t a Kubernetes deployment, Helm is being used to build support for the “Suggested Improvement” of deploying to a Kubernetes cluster. |
| Docker | v20.10.8 | Container runtime engine. |
| Docker-Compose | v1.29.2 | This is a tool for defining and running multi-container Docker applications. We'll use it as our primary deployment method for both production and development instances. |
| Nexus | v3.33.0 | Repository manager where we'll publish our artifacts. |
| Jenkins | v2.307 | CI/CD automation server. Used to automate build, testing and deployment. |
| Ansible | v2.10.8 | Configuration Management server. Used to automate configuration changes in server resources. |
| NGINX | v1.21.1 | This will be the web server that serves our frontend application. A separate instance will serve as our reverse proxy. |
| NodeJS | v10.19.0 | JavaScript runtime environment for server side execution of JavaScript. |
| Cohort | v0.1.0 | Self written Typescript library that provides a light-weight framework for creating single page applications (SPA). |

<br />

### Summary

The total application (APP) consists of three parts. A frontend (GUI) written in Typescript, a RESTful service (API) written in NodeJS, and a MongoDB instance (DB) for data persistence. The API will communicate with the DB for document storage and retrieval, and will respond to requests made by the GUI to save, retrieve or delete a document.

The APP will be deployed in the same Docker-Compose under two separate HTTP host headers. Capstone and Capstone-Dev. This will provide both a production instance for customers, as well as a separate instance for developer testing.

As development gets completed, unit tests passed, and code is peer reviewed and merged into the develop branch, the changes will be deployed to the Capstone-Dev instance in order for test engineers to perform testing. Once testing is completed, with all tests having passed, develop will be merged into the main branch which in turn will be tagged with a release number. Once that tagged versioning occurs the changes will be deployed to the Capstone instance.

<br />

### Unique Selling Points

<ol>
    <li>
        By implementing unit tests developers can test their code as it's being developed so that when they check it in they'll have high confidence that it's reasonably bug free. Additionally this will serve as the base for providing higher quality code. As code is checked in unit tests will be automatically ran. Feature branch build failures will ensure that broken code is not introduced into the main trunk.
    </li>
    <li>
        By leveraging Docker-Compose and two separate HTTP host headers we can use the same server to deploy two different instances of our APP. This enables us to perform regression and integration testing before deploying to production. 
    </li>
    <li>
        By catching bugs prior to release, code quality increases and customer satisfaction improves.
    </li>
    <li>
        Through automated build, testing and deployment, manual performance of those tasks is eliminated and software updates occur faster and more consistently.
    </li>
</ol>

<br />

### Suggested Improvements

While the above is a step in the right direction it should not be viewed as the final solution for improving code quality and efficient delivery. The below are just a few examples of how the solution can be improved upon.

<ol>
    <li>
        When possible two separate Kubernetes clusters should be provisioned for testing/demo and production. The former can be provisioned as a single node cluster but the production environment should be a minimum 3 node cluster.
    </li>
    <li>
        The production environment should be replicated to a failover environment to ensure disaster recovery and business continuity.
    </li>
    <li>
        Regression and integration testing processes should be evaluated for automated testing opportunities and where possible testing automation should be implemented.
    </li>
    <li>
        Consideration should be given for implementing one of the many service mesh variants. Such an implementation would provide the following benefits:
            <ol>
                <li>
                    <strong><i>Observability:</i> </strong>Because it's a dedicated infrastructure layer, service mesh is uniquely positioned to provide telemetry metrics at the service call level.
                </li>
                <li>
                    <strong><i>Traffic Control:</i> </strong>By controlling the flow of traffic between services, service mesh service-level properties like circuit breakers, timeouts and retries make it possible to do A/B testing, canary rollouts and staged rollouts with percentage-based traffic splits.
                </li>
                <li>
                    <strong><i>Security:</i> </strong>Service mesh hardens individual services through things like certificate-based service-to-service authentication, traffic encryption between services and security policy enforcement.
                </li>
            </ol>
    </li>
    <li>
        Finally, when resources permit, consideration should be given to setting up Jenkins in a Master/Slave configuration with at least two build nodes running on different VM's. This will further eliminate latency and improve build efficieny and timeliness.
    </li>
</ol>

<br />
