```sh
# Après chaque modification
docker build -t md2png .
docker stop md2png-container
docker rm md2png-container
docker run -d -p 3000:3000 --name md2png-container md2png

# détruire
docker rm -f md2png-container

# logs
docker logs md2png-container
```
