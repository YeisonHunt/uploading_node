# Instructions

Run with : 
1. ``` npm install ```
2. ``` npm run start ```
2. Open uploader.html and choose a text file [lorem.txt || loremGenerated.txt].
3. [Optional] => You can generate a file of 300mb aprox if you run ``` npm run generate-file ```

### Perfomance annotations

1. Clustering was enabled for the server [app/city_forniture.js] for concurrency support. 
2. Quick sort was used instead of default sort because is more performant. From 5 to 15% faster than default on my tests.
Reference =>  https://medium.com/human-in-a-machine-world/quicksort-the-best-sorting-algorithm-6ab461b5a9d0

### Enjoy
