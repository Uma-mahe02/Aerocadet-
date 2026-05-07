const express = require('express');
const app = express();
const PORT = 5001;

app.get('/', (req, res) => {
    res.send('Minimal server is running');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
