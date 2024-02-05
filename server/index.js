const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const {keccak256} = require('ethereum-cryptography/keccak');
const secp = require('ethereum-cryptography/secp256k1');


app.use(cors());
app.use(express.json());

const balances = {
  "039135714e3cf7b57bb7c666f859090eabe0cfdc842a5d82483403b91fc7bac18b": 100,//e92daa9594a9084e8c6016268f7af5309130386969089094636471a9e900005e pkey
  "03b4dbf8582e940f8f80ef2d55489740c3963f3d8c4d89318fefc0e70623e7c1f2": 50,//9e301bf92f4e1617819e8d5841718b7cf22b03a7f535c63da3d5ac36f54b8b4f
  "02243ab160179fae5d8bd1d9043680c051bccb626ddf6c8f4949e4461218c7f850": 75,//d7f6394dad31ca71a7395ed8532866a9ffa876fd199cdd03db598743f5fdf50e
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {

//todo get a signature from the client-side applicaiton

//recover the public address from the signature


///////
  const { sender, sig:sigStringed, msg } = req.body;
  const {recipient, amount} =msg;
  const sig = {
    ...sigStringed,
    r:BigInt(sigStringed.r),
    s:BigInt(sigStringed.s)
  }
  const hashMessage = (message) =>keccak256(Uint8Array.from(message));
  const isValid =secp.secp256k1.verify(sig,hashMessage(msg), sender)===true;

  if(!isValid) {res.status(400).send({message: "Bad signature!"})};

  setInitialBalance(sender);
  setInitialBalance(recipient);
    
////////


  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
