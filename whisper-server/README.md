# Whisper Server

This Whisper prediction server for SageMaker is based on 
https://github.com/aws/amazon-sagemaker-examples/tree/main/advanced_functionality/scikit_bring_your_own

The concept for this server is briefly explained here: https://docs.aws.amazon.com/sagemaker/latest/dg/your-algorithms-inference-code.html

Compared to the typical approach in both of those links, our case does not use SageMaker support for loading model data, instead using the simple Whisper model data loading functionality built in

Base image originates from [Podwhisperer](https://github.com/fourTheorem/podwhisperer)

## Development
Run the model locally:
`docker run -v $(pwd)/test_dir:/opt/ml -p 8080:8080 --rm <IMAGE_ID> serve`

## Known issues and bugs
* Don't push an image built on ARM (M1 mac) to the container registry as it will not run

