import React, { useState, useEffect, useRef } from 'react';
import { Grid, Typography, Button, Paper, Box, TextField } from '@material-ui/core';
import { Crypt, RSA } from 'hybrid-crypto-js';
import CryptoJS from 'crypto-js'

const salt = CryptoJS.lib.WordArray.random(128 / 8)
const K = CryptoJS.PBKDF2("K", salt, { keySize: 128 / 32 })
const IV = CryptoJS.PBKDF2("IV", salt, { keySize: 128 / 32 })

function download(fileName, text) {
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', fileName);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function App() {

  const [tela, setTela] = useState('inicio')

  const [passo, setPasso] = useState(0)

  let nome = useRef('')
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')

  const [kCripto, setKCripto] = useState('')
  const [IVCripto, setIVCripto] = useState('')

  function gerarChaves() {
    const keys = new RSA({ keySize: 4096, entropy: nome.value })

    keys.generateKeyPair(keys => {
      download(`PR${nome.value.split('')[0].toLowerCase()}.txt`, keys.privateKey)
      download(`PU${nome.value.split('')[0].toLowerCase()}.txt`, keys.publicKey)
      setPrivateKey(keys.privateKey)
      setPublicKey(keys.publicKey)
    })
  }

  function carregarX(e) {
    download('K.txt', K)
    download('IV.txt', IV)
    let reader = new FileReader()
    reader.readAsBinaryString(e.target.files[0])
    reader.onload = (e) => {
      download('Y.txt', CryptoJS.AES.encrypt(e.target.result, CryptoJS.enc.Hex.parse(K), { iv: CryptoJS.enc.Hex.parse(IV) }).toString())
      const crypt = new Crypt({ entropy: '', md: 'sha512' })
      download('K(criptografado).txt', crypt.encrypt(publicKey, K))
      download('IV(criptografado).txt', crypt.encrypt(publicKey, IV))
    }
  }


  function carregarPR(e) {
    let reader = new FileReader()
    reader.readAsBinaryString(e.target.files[0])
    reader.onload = (e) => {
      setPrivateKey(e.target.result)
      setPasso(1)
    }
  }

  function carregarK(e) {
    let reader = new FileReader()
    reader.readAsBinaryString(e.target.files[0])
    reader.onload = (e) => {
     setKCripto(e.target.result)
      setPasso(2)
    }
  }

  function carregarIV(e) {
    let reader = new FileReader()
    reader.readAsBinaryString(e.target.files[0])
    reader.onload = (e) => {
      setIVCripto(e.target.result)
      setPasso(3)
    }
  }

  function carregarY(e) {
    let reader = new FileReader()
    reader.readAsBinaryString(e.target.files[0])
    reader.onload = (e) => {
      const crypt = new Crypt({ entropy: '', md: 'sha512' })
      const k = CryptoJS.enc.Hex.parse(crypt.decrypt(privateKey, kCripto).message)
      const iv = CryptoJS.enc.Hex.parse(crypt.decrypt(privateKey, IVCripto).message)
      download('X\'.txt', CryptoJS.AES.decrypt(e.target.result, k, { iv }).toString(CryptoJS.enc.Utf8))
    }
  }

  return (
    <Grid container spacing={2} style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', textAlign: 'center' }} >
      <Grid item xs={3} component={Paper}>
        {tela !== 'inicio' && <Button onClick={() => { setPasso(0); setTela('inicio') }}>Voltar</Button>}
      </Grid>
      <Grid item xs={6} component={Paper}>
        {tela === 'inicio' &&
          <>
            <Button variant='contained' color='primary' onClick={() => setTela('cifrar')}>Cifrar</Button>
            <Button variant='contained' color='primary' onClick={() => setTela('decifrar')}>Decifrar</Button>
          </>
        }

        {tela === 'cifrar' &&
          <>
            {publicKey === '' && privateKey === '' ?
              <Grid container>
                <Grid item xs={8}>
                  <TextField label='Digite seu Nome:' fullWidth variant='outlined' margin='dense' inputRef={input => nome = input} />
                </Grid>
                <Grid item xs={4}>
                  <Button style={{ marginTop: '8px' }} variant='contained' fullWidth color='primary' onClick={gerarChaves}>Gerar Chaves</Button>
                </Grid>
              </Grid>
              :
              <>
                <Button color='primary' fullWidth variant='contained' onClick={() => document.getElementById('x').click()}>Importar Arquivo (x.txt)</Button>
                <input type='file' id='x' onChange={carregarX} hidden />
              </>
            }
          </>
        }

        {tela === 'decifrar' &&
          <>
            {passo === 0 && <>
              <Button color='primary' fullWidth variant='contained' onClick={() => document.getElementById('pr').click()}>Importar PR</Button>
              <input type='file' id='pr' onChange={carregarPR} hidden />
            </>}
            {passo === 1 && <>
              <Button color='primary' fullWidth variant='contained' onClick={() => document.getElementById('k').click()}>Importar K criptografado</Button>
              <input type='file' id='k' onChange={carregarK} hidden />
            </>}
            {passo === 2 && <>
              <Button color='primary' fullWidth variant='contained' onClick={() => document.getElementById('iv').click()}>Importar IV criptografado</Button>
              <input type='file' id='iv' onChange={carregarIV} hidden />
            </>}
            {passo === 3 && <>
              <Button color='primary' fullWidth variant='contained' onClick={() => document.getElementById('y').click()}>Importar Y</Button>
              <input type='file' id='y' onChange={carregarY} hidden />
            </>}
          </>
        }

      </Grid>
      <Grid item xs={3} component={Paper}>
      </Grid>
    </Grid>
  );
}

export default App;
