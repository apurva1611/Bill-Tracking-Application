cd /opt/codedeploy-agent/deployment-root/deployment-instructions/
sudo rm -rf *-cleanup
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/home/ubuntu/webapp_node/cloudwatch-config.json -s