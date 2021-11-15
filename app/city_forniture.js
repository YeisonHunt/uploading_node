const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const app = express();

// enable files upload
app.use(fileUpload({
	createParentPath: true,
	limits: {
		fileSize: 900 * 1024 * 1024 * 1024 //900MB max file(s) size
	},
}));

//add other middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);

	//Fork workers to increase concurrency depending of how many cores we have on the machine.
	//Note: this is to increase parallel performance, not single core performance.
	for (let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}


} else {

	app.post('/most_used_words', async (req, res) => {
		try {
			if (!req.files) {
				res.send({
					status: false,
					message: 'No file uploaded'
				});
			} else {


				//Use the mv() method to place the file in upload directory (i.e. "uploads")
				//avatar.mv('./uploads/' + avatar.name);
				const n = req.body.N;



				const text = req.files.textFile.data.toString();
				const words = text.toLowerCase().split(' ');
				let frequencies = [];
				const wordCount = {};
				words.forEach(word => {
					if (wordCount[word]) {
						wordCount[word]++;
					} else {
						wordCount[word] = 1;
					}
				});
				Object.keys(wordCount).forEach(word => {
					frequencies.push({ word, count: wordCount[word] });
				});


				//frequencies.sort((a, b) => b.count - a.count); //native sort.
				//I implemented a quick sort to frecuencies object // is 5 - 15% faster than the native sort
				// Reference => https://medium.com/human-in-a-machine-world/quicksort-the-best-sorting-algorithm-6ab461b5a9d0

				frequencies = quickSort(frequencies, 0, frequencies.length - 1);

				res.send({
					frecuencies: frequencies.slice(0, n)
				});
			}
		} catch (err) {
			res.status(500).send(err);
		}
	})

	function quickSort(frequencies) {
		if (frequencies.length <= 1) {
			return frequencies;
		}
		const pivot = frequencies[Math.floor(frequencies.length / 2)];
		const left = [];
		const right = [];
		for (let i = 0; i < frequencies.length; i++) {
			if (i === Math.floor(frequencies.length / 2)) {
				continue;
			}
			if (frequencies[i].count > pivot.count) {
				left.push(frequencies[i]);
			} else {
				right.push(frequencies[i]);
			}
		}
		return [...quickSort(left), pivot, ...quickSort(right)];
	}

	function merge(left, right) {

		let arr = []

		while (left.length && right.length) { //Break out the loop if any of the compared arrays are empty.
			if (left[0]['count'] < right[0]['count']) {
				arr.push(left.shift())
			} else {
				arr.push(right.shift())
			}
		}

		return [...arr, ...left, ...right]

	}

	const port = process.env.PORT || 3000;

	app.listen(port, () =>
		console.log(`App is listening on port ${port}.`)
	);
}
