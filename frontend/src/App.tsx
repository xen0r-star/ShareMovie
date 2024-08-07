import { useState } from 'react';
import background from '/docs-right.png';
import logo from '/logo.png'

function App() {
  const [homeButtonRed, setHomeButtonRed] = useState('Watching');
  const [homeTitle, setHomeTitle] = useState('Connection');
  const [homebuttonGray, setHomeButtonGray] = useState('Administrator');

  const loginType = () => {
    if (homeButtonRed === 'Watching') {
      setHomeButtonRed('Connection');
    } else {
      setHomeButtonRed('Watching');
    }

    if (homeTitle === 'Connection') {
      setHomeTitle('Administrator');
    } else {
      setHomeTitle('Connection');
    }

    if (homebuttonGray === 'Administrator') {
      setHomeButtonGray('Watching');
    } else {
      setHomeButtonGray('Administrator');
    }
  };

  return (
    <>
      <div className="flex items-center justify-center h-screen w-screen overflow-hidden bg-black">
        <img src={background} className='absolute'></img>
        <div className="flex items-center flex-col p-6 bg-black bg-opacity-50 rounded-lg max-h-screen translate-y-24 mx-auto h-full max-w-md w-full border-gray-300 border-y border-x border-solid">
          <img src={logo} className="w-full h-14 grid-cols-1 mt-10"></img>
          <h1 className='mt-10 w-full text-4xl font-bold'>{homeTitle}</h1>
          <div className="h-40 w-full flex flex-col justify-around">
            <input type="text" className="h-14 bg-gray-800 rounded p-3 w-full text-left text-2xl text-white uppercase font-extrabold" maxLength={25} placeholder="Code"></input>
            <button className="h-14 opacity-90 rounded-2xl p-3 w-full bg-red-700 bg-opacity-10 border-red-700 border-4 border-solid text-red-700 leading-none text-xl text-center font-black uppercase">{homeButtonRed}</button>
          </div>
          <button onClick={loginType} className="relative h-14 opacity-90 p-3 w-full text-gray-500 leading-none text-xl font-bold uppercase">{homebuttonGray}</button>
        </div>
      </div>
    </>
  )
}

export default App
