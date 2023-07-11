# Whisper Server

This Whisper prediction server for SageMaker is based on 
https://github.com/aws/amazon-sagemaker-examples/tree/main/advanced_functionality/scikit_bring_your_own

The concept for this server is briefly explained here: https://docs.aws.amazon.com/sagemaker/latest/dg/your-algorithms-inference-code.html

Compared to the typical approach in both of those links, our case does not use SageMaker support for loading model data, instead using the simple Whisper model data loading functionality built in

Base image originates from [Podwhisperer](https://github.com/fourTheorem/podwhisperer)

## Development

**Set the repository URI**
export REPOSITORY_URI=<YOUR_REPO_URI>

**Build the container image**
´docker build -t $REPOSITORY_URI .´

**Log in to ECR with Docker (make sure to set AWS_REGION and AWS_ACCCOUNT_ID)**
´aws ecr get-login-password | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com´

**Push the container image to ECR**
docker push $REPOSITORY_URI


**Other**

Run the model locally:
`docker run -v $(pwd)/test_dir:/opt/ml -p 8080:8080 --rm <IMAGE_ID> serve`

For local development
`docker run -v $(pwd)/app:/app -v $(pwd)/test_dir:/opt/ml -p 8080:8080 --env-file .env --rm whisperserver serve`

Get the remote image
`aws ecr get-login-password --region <AWS_REGION> | docker login --username AWS --password-stdin <AWS_ID>.dkr.ecr.<AWS_REGION>.amazonaws.com`


## Run the test locally
```
# Assuming the docker conatiner is running on port 8080
cd local_test

# Make script executable
chmod +x predict.sh

# Run script pointing to a file

```

## Known issues and bugs
* Don't push an image built on ARM (M1 mac) to the container registry as it will not run
* Don't push stuff built on windows either due to the difference in data formats or edit it. [Reason](https://askubuntu.com/questions/896860/usr-bin-env-python3-r-no-such-file-or-directory)

