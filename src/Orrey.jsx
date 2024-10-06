import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const celestialData = {
  Sun: {
    description: "The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core.",
    diameter: "1,391,000 km",
    rotationPeriod: "27 Earth days at the equator",
    surfaceTemp: "5,500°C",
    coreTemp: "15 million°C",
    age: "4.6 billion years",
  },
  Mercury: {
    description: "Mercury is the smallest planet in our solar system and closest to the Sun.",
    diameter: "4,879 km",
    orbitalPeriod: "88 Earth days",
    dayLength: "59 Earth days",
    gravity: "3.7 m/s²",
    avgTemp: "167°C",
  },
  Venus: {
    description: "Venus is the second planet from the Sun and is Earth's closest planetary neighbor.",
    diameter: "12,104 km",
    orbitalPeriod: "225 Earth days",
    dayLength: "243 Earth days",
    gravity: "8.9 m/s²",
    avgTemp: "464°C",
  },
  Earth: {
    description: "Earth is our home planet and the only place we know of so far that's inhabited by living things.",
    diameter: "12,742 km",
    orbitalPeriod: "365.25 days",
    dayLength: "24 hours",
    gravity: "9.8 m/s²",
    avgTemp: "15°C",
  },
  Mars: {
    description: "Mars is the fourth planet from the Sun – a dusty, cold, desert world with a very thin atmosphere.",
    diameter: "6,779 km",
    orbitalPeriod: "687 Earth days",
    dayLength: "24.6 hours",
    gravity: "3.7 m/s²",
    avgTemp: "-63°C",
  },
  Jupiter: {
    description: "Jupiter is the fifth planet from our Sun and is, by far, the largest planet in the solar system.",
    diameter: "139,820 km",
    orbitalPeriod: "12 Earth years",
    dayLength: "10 hours",
    gravity: "23.1 m/s²",
    avgTemp: "-108°C",
  },
  Saturn: {
    description: "Saturn is the sixth planet from the Sun and the second-largest planet in our solar system.",
    diameter: "116,460 km",
    orbitalPeriod: "29 Earth years",
    dayLength: "10.7 hours",
    gravity: "9.0 m/s²",
    avgTemp: "-138°C",
  },
  "Near-Earth Asteroids": {
    description: "Near-Earth Asteroids (NEAs) are asteroids that pass close to Earth's orbit. They are of interest for scientific study, potential resource mining, and impact risk assessment.",
    population: "Over 28,000 known (as of 2023)",
    size: "Range from a few meters to several kilometers",
    composition: "Mostly rock and metal",
    orbitRange: "Typically between 0.983 and 1.3 AU from the Sun",
  },
  "Near-Earth Comets": {
    description: "Near-Earth Comets are comets that pass close to Earth's orbit. They are of interest for their potential impact risk and as remnants from the early solar system.",
    population: "Over 100 known",
    size: "Typically a few kilometers in diameter",
    composition: "Ice, dust, and rocky material",
    orbitRange: "Varies widely, but perihelion distance less than 1.3 AU",
  },
  "Potentially Hazardous Asteroids": {
    description: "Potentially Hazardous Asteroids (PHAs) are asteroids that come within 0.05 AU of Earth's orbit and are large enough to cause significant regional damage if they were to impact Earth.",
    population: "Over 2,000 known",
    size: "Larger than 140 meters in diameter",
    composition: "Mostly rock and metal",
    orbitRange: "Come within 0.05 AU (about 7.5 million km) of Earth's orbit",
  },
};

const Orrery = () => {
  const mountRef = useRef(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = 50;

    const textureLoader = new THREE.TextureLoader();

    const sunTexture = textureLoader.load('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXYWgCqZw1OQYHbmcd3EMJXR73Zv5lnSHthA&s');
    const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData.name = 'Sun';
    scene.add(sun);

    const planets = [
      { name: 'Mercury', size: 0.5, orbit: 10, texturePath: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQA/gMBIgACEQEDEQH/xAAaAAADAQEBAQAAAAAAAAAAAAADBAUCAAEG/8QAQhAAAgECBAQEBAQDBgUDBQAAAQIDBBEAEiExE0FRYQUicYEUMpGhQrHB0SPh8DNSYnKC8QaSosLSJFOyFRZjdPL/xAAYAQEBAQEBAAAAAAAAAAAAAAABAAIDBf/EAB4RAQEBAAMBAAMBAAAAAAAAAAABEQISITFBYXFR/9oADAMBAAIRAxEAPwD5OSBgt4HMgH9+MY6kaSZWbgxOE6KcN/E1dMyMUZhyI0HvbFBfFFnVkqYTGdgF1Zjz0/fHga9hNilhZwhpKZz/AJifrrhiVY1OVKPw9iBqBI2nrrgk8FGsaz/BWEuiLICtz2Ay64aEdHQSU71dIaSRwyLG0hIJHJnuQMOLSYjhERkanpQBuUmJA+t8BSro00+GF+mYfqMOGupaiazUyxgfMI7XX6DX7YmV8sQk/wDRo0SdDIGOD8+I5HOJc3ApHW25KI36YVkraiOTK3DS3/uU0Z/7cZp5EihIqCrsXspYuDfvlNsCBinfMrEMx/sRcLfoCSScMlOH1rpynkqfDr9Gp4/2wIVPiLMSODJGNSYooh/24IfDk4ax1MZEhexCFcwb+7exOnrhGRI4sqRPqujWRVI+9vqcPb9jIojxKEA5o2BG+Yx/lkx6viVEVuZrNyHw6W/LCUTU4YSQxvPINWUygED9fbBSnh8qZxBULKDtF5hfoc9jbFP6shha+F2yuUA5FYkJ+mXGKuojiy8J3JbrTRgf/HG6emihbjVMLvFcKrKUIJ9muR6DDHjUdFURpLTCKLTTLdS3rcYNSPL4hUR6EU9v8UER/wC3DFJ4rcgS09E4/wD04/2wGooyAkgiAQiysoBDHvbn9cNU/wAJmWWvEr5fKVjK2Hr09DbCjhqlkizxeFUxT+98JGR+WEZqklsogoIz0+CjJ/8AjijVHw6saNqSshpAoKlbMisf8TDTCVVDDLTxPCY4WzFDJmkZGPY5db8sE/qA4oyZ2hp2XqlNF+wwaMRSDNLFTRpuC1OoJ+hxlfDZowkTrPIJFzZY4zq3owB+owWOgnWnaUUsixx6ySVAjAy9r2Nx74vUwtLDUEiGKEgbkIi/rjm8HhOjkR3/AMQAxiHKlWwdShdPI6vlTsTYHT6dxilTxfEoiyyQqb5eI3m120y6Hfc4Lakqo8IMC5mi8h2cyWBwunhvEaywyW6q38sfa03hkEMUbPNIQjW4kYa32ONmlhlLlVlvmy5nN9Ovb74Zo18DJS08UxjcyHrZ8Mp4OJEzQGZ16WBt9MfXTz+G0qyGNllaM2ZxS2y/6tBiVTf8RJSyzZdCG8pWnGVvXvi2ragmjeI2ELnu0Z/fBo6CaRbmJAeQKkfmcWpvGPjIWqKtGUxnThlQSey/ucDl8SUqwmiZxvowYhe6o3l9zg2nUVqN4tZorDll/wD6x7FCzEWhhAO2dmuf+rD88sbQmSkpJIwu+R226kDDyz0kkSJJLG8umQCNgx+o1w7VqX8PLGbNDSDpct++POIOQpNP/wAf88VZ6ekNgZStR8oXKxsfpf7YHSUVNeRJ3Dyg6/xSD+mMrW6ieN7GdShzWA2CcrWOAx0YlXOGcxvoBcA3DWuPfbFZFPwsczvG9gCWaFCSDqNueu4t+uJphImRqV3WMkmSKNyt9DZsuo3Fv0IviwaGYRTwSLVK9lJCA6ka8gffXGp46aaEVEYEaRElgqi2UG1r23ucUB4PM8KfFtHHC7X8hFu45W9ML13h89OYYZXtYFUyvmyrfQmx0FraW54fVpSc00ssd43UJ5sjWbON9l59sEelpGikkEcjDUIJE0a50F72v6dMANMCgWWzXNhk/DvqBfQ98OmmeQq0SsvFWx4ZOg6lTounS36YpSDQ+GUq5JZOGZWsyhc3l02IPfGq6kWKnfgwF2Y5bhScg3A1wRJZZBEqQSScEWMr2GawNwW0NtN7i9tsP0kEkdPmaRISQXyJHoQdbHUcttT641rOoMcdUIDA8zKUN+FIuraX06WwWjonEMPCiczsSrB5MoZeYH9csX6qnRlEsdOyvcrmbRspHLW1txbXGESOikRJIVUSsMzHkQOZP7jAtQJ6eFJVjp4Wzj53BOb7nUYJwODVfwWI8liY01I6/wC+KVPXBZZ85V8qA2QK2Vr63uBf2IwglW+fMIJAbFlVrNn28txtfTlppipeVixpMJVkClRYxuA2U974AKqCqMnFFwzgXFg2u2h0tinX5ZYLtAI5Mh4jhFIuOpP6jCccUsUQmHkVU1ZWF76DTQW52Ht3weoRcterQwGeN1T8UlvLpYD89OmMTwQPSxUsx4tQXtGCpZo0tfe/prhinmnzossqpm1AQjXXmbXP7XwxJQyPPx0kkEpk88kbgsBzFwAbdje2GVJc3hklLTXjCsHILJIvTmDy9cJ0ZUU8ysHzI4Wyy2Vdea7EY+jqKOhVXKyvEWTSQKWJtvz6ED9sLUcJoITJSugBvm4sa3/5bG2v++HUQy16NmrQY2iIEJU2Nid7cxh2Jfi45Enqo5YJdGWOMKG/zHe+2AU7T1IbO0bRA5TqSsg1sSL6WtuN9j1xVoEnBl4UiF7ZljVQBm/MD688Z1UvF4RKvAdljdFQBCToNNgDgnAVJsj2ldbC6ZSLHb6YeaKUvKpimKIeGnDcDPcdbhrbbWwq9JVtCpSJlaJxaNFOl9LBdvyNr97tglZpKOcRs1PIUBNlVyTnUdsYlWn+FZZ0eBonLlCwYdmA5dhywrU188dWXQKqIAjBU81umY7ffAWR56KZpWhjMa5gsrDMSRoRYam+wNhg38Eu9TIyztDUwyO7A/xrZiO42Pb8sTzRz1AqGpoWPAsryuxzbflilS0UxyIpRX+e0itbNr81vb9TgtVRRmXg0tLqqgZkJzoRuLEm9ut8alKHFSJE6STvERp/DV9d8UJuOSgouJwpQSSjMB0IPpg80EnAmF2dGYDIXzP6m3U6b2+2AikJjyhmjZVAKyN5b8yLAfc4zanDwqtkVnUyq4BDXNlYaW2wjTU7qRLFPlmSUrlVipHcEfpipTeJVqxGN5yUAPly6Aa9ib7bYGFHDSRMzqhHFDuCfUaD739MXZPAsYgRl+IhkP8AaGxVyeeu5wWlQwO0JllZmGdRKigZeoLDXfHE8RQ9XEpcAnMU8zDoR8pxpIFkiAiRlY6swkyn0tpYdhppi1KLeFywTRmMEALmKLfU9gfW/pc4orRNGiuSczWU8rjbfrc/rh4UCSIzVycQKc0T3IfKCbZri17YXXjNVkw5xFlEYe97jzEkHYjYY31c9LFoXowvC4hmJXMzG6qL6HTt1wvTU8FNDION/GYZZFK3673tc74sTSkF04lPCqL8zrmbQ6dhr9sSJkrainFbMwjKrlhkiUAEbG43NxrrtrYjGlGPg6SGltI5Tir5Wvc7fTY+mDT/ABQ4TPmKgsoBXnre+XbT0F74co4G+FeWo4hnc5myArptma5/D8w56W54OgaMSmnUxgW4bA5i/UkH37kYz1OlqNJo4TGppxIxLeYkkC97EAXvvpjUFHTpTunEzNIVLqQWtYd/bA1pKipCpLljidj5V1sd81973/TFSigppA8lo5JwCocrc9B0wyCmqmJVIpojZcvO9rX0PYa/fEbxGikrauPhy07KozB47jLY6qeRPviw86xOqKwU2BYMSVA5jp3x8/4x4gsrK6PHHASOMVNlOUBtrG50O3UdMas0TSsFLFE1RNIrSG1pEdLWc33v/XbHlJTxOgeF14sQDSoqEs69huPyPXCDMtRHXMojEYN8kSlLi50P965vrjDKh8N4gWWQvGmdGF2RDm+Qkcyb37E8hjORvGqiUylojL8rN5JAVFx1AuQbYUnnlhoGjibOhzIjoV1Uf4dxrfGavIqR5RLc5gBc3BB07HTA40kjiR5EZ4nkCqG0zbnTt+RxmwmKGmAKtUTKMxVrsNm3AuNtsV6ueSGCKSIMzgEzuy8uo/obYlU1OVr0ZSjFmdgoJIKBd/XbXfH0M1HGtE4MicQKRHJck6na+x3v74sVpTwaCslqlqKyndoGISN7381yRdRsdNu3pitXeHx1dMxLEljl4qak23Cgb88bZKqrpRDUCmNimZFzZrggjLbbUXv27Y1VxUPh4p0mvLwlKoLeY3FjYnUbffG8ZtQ38J4ecqpzRhUcZuY1IsNt1OU676YcpKeaY3y5EQBAF/EAdTblv/QvijHSVLEJUVC1Sr/bhzcZtLAWGpFiDfe46CwKunjgApaVG+YA+YELsb6betuuDqtZ+JfKsN+EVTMSBobeW4+2+EJ+M80TmeWnEgIJYnz3sOWo1K6nFdZJUgRpBGXexJlWwBOwsPX7YRmWoqKmWjhaKanFs4jRQbE6qCeVx9APTDgKfBUx/ihzaI2Nttt+eMx0nlmNGpnhfW5APY21vsPY+2GvDYJJKk8aZngiY2fJZhfQWI5jTl9sPcMCZSsUhdZCr8SSxjX25khbgaG/bGerWp1FYwiNo1WMnMrMbX6CxA/q2OrRkqs0cZNxYfhLWH1/mcOVQq3lOQghRpK1swB5bc9NcbpKWFXENSFMbASBTtfS2nb1xYNCo6RoqANOpuVtLYGynly1tc69sAq/DCsDsksYkfV4iCWbqAeX5Y+ilyU6MdVCm6hLgkW2Fuem+JvidYvCMYaHjgB1kTykaG+p9t++HoJXz7eEmJoopmJlbyqwQka8gf8AScajgh47Ru4jDfKTa19r9LnC8tRHPLTRBoJJGJaRitzckHKGsOZOum2M08URraiOTikRupOpYSEnY3uBrYd8Y6t6YrXanm4TOQUGS5S2a2ml9dfTGUo/EZqUrQrG4Vxe0mq6HQ64Qc6zmSOVJRmzW0XMCL5Qth6dcEoqlzSRZYnkijuFUMVykm5vrqTYa4rxT7BvF6KqSyhwwOVo33jY6AG5B/ffC1RLSyiJaaqSEQgu6LMqrceotzPX8Omt8ILFSpPkp6qWYxopywyW4h7dBcHbTXDFUwpYZwJ5AshBdn8zLa+npsPXXnjpusYYWSmliMaTjhq5VZGci2m6j8Qte19OeoxqTw9xRws3DZIoZGHCByOSbA6b3305X25hipVdEaNlcGTNaX8enPTU6YpUyESRTFQGRiA4a1yTbKe2gsOo+qgKKhaB/LIzyPqyMAGXfXffbD1PSGJX4zeZgCut76f1bGZKlqeZBIDJnGQ5VtY2OmGpDeJiuZ5GUAINTfke2JnS9NQyVOd2dRERbz6MDfry2HocGFItBA8iyZnyGRwNcxG9ra9MTGaSN1iSnQS65g7gBgbXJA1AJuPfFXw6Mws0aoYootsxOV9ACe/8sMVSpo5YZY5J1jeOWNbq0gFh5sxHmuxByDYfNzN7QazxCOSmKpkDZsxlQBWXewUHl39baYu/8U1SSI0cEiJbhghRcEA3+XtfbHzUMb00yPMdWu8M50OXnvy3HvjNrfFpqiFlMEyXCutyhvkGUWJ131J2xmlNLVO0ivULGHCm4N7W1toQdAdeV9hgEkkVU+SONUnuuiFTlA0uNNfTCkXzzMZ8s7A5W0AYXzLa23ykehIxhoyTTvkWR5BNeyrmDFfNbkf5b48dYViWXLYxF1jutg+u9+u225GJ9PThZUDsqK987WsA1r2/rbFKophFTSxxcFuHEQSoBbMWu1/cDfFU9aZ5eDJTAPJHcrICDcj00Hvvj6SlDpnkqF4ceQFTmzC+otlyjzbX33FsfIeEVUygLwtCeYAG4O/Pbvi49feNRSl1y6CQOAoFyfrrocPwWPpjUJBQzzwTpFw4yf448i21Nxa49cLeERLVRQzVtHnqCR52X+zBHc/lfCfh9PkKM1Q8qajLNZhfQ269/bFQTMwZ6UghQP4apyB1t7Y1KzWKjxahiq5aQq0cjbDTK7G4tfYHbfffUa4UlqaMwShHEM0gyxPmswN9Oul+22Jkoo2d5RXuGknUKMxugI68982ve2GokWNUmiadTGSVEj3VupI+vobdMWrBYJIaeVYxUiV7MptICAo1GYrsbHue5GuNxUhkjqvh5UkDQhDwSWdNRoDvqDve/MXwpSKlU7sJ2Lgve62y3FtOltv9OH6envGtPJDHIpjy6CwNyMzaDfQWPX64UEfDwKl3aYxrC+UXHlbYk3a179RYWxRSjmZ1kkIVQVDDS1uVv6OPBUXThrctDbTQ5wL215nDNHOKqESgmMEhtRa+n3vtiGl6inkmlMcBJvyOqsDuBrr77fbDS+FIknFeVbILoQ17Hmf5+uE64BA8wjK+VrSGy5B648hlDVGd4yaiVsrtGSWXnrbnri/I17WpNNxbOVWCWO73sLAi5BLbWJ689DpiPU+IRxSoTDDnKDND8wznqwuLDsdcfT+KVUUFOVkkTiB18wNmIF7E9xpj4CWKWUzTEmWONn4qMugUsRf8sXLw8Y3T1QRswvIWbKASuYWXyquu2vcd+olelkeKCLjrK5+UXGXlYkbdeY9N8aqquBTFFPw2W6kEsDlbYIb8gGP54n1MHmjjnkMce+lvISbKbjUjGHQ9UcBJMrySmNogxOZQL30AG9rdb+uMTPSxRRGBisrZhIMhUWHy2sL8+f6Yn1Uby1TSsQ7C7oEvcZvNpyAA5Da2HKxBVPC6OJ4+HttbpisT6COMKwR57LKzMhjGUubnuTb3xkK9PJxEVskbWOa5YXIvre+pI3BsA2CNCzpkyFiulpNRdrE6+pPt64F54ZEAklEkhIMa2sx5A9vpbCydilDRATXkZRZ5JSbPbUHof2w4RHNDCGLIZAUz284bkBa4GvP9DiBTzSinigdGdXtwyb6N2A774rwirWWSeW6tJYa/KdSug3vYAXGGBYWnoFqkilkzVAQeTvy12v0ucHijjUmYBbFBIlxfU3J+mn77Wk05lMRtUFZCUOQizKM2pHO9uR7+uGYxIAr04QQsuZAjHbewU9vpjesNqZZ5jM7Rsq+QsdgN72AFz720G5wasqc9NIKURJHEBYuSpLk2GnTX/fE9auOWJTFIpeIWGW98xBIuPS/uCNdMKT17JTtEXkqJblmSMEkrfS+1vXtg04j+MRI8iNEzcRrM9lyqzAAeU9D6b9MTpDO3iMdNC7MVUW4r5dz+hx9UlXI1HDK5SeSLM9zMtkuWC3/6lv8A4TsdMQpOBOslQxKTxOJEIbUi9vKefXGLxblIvBwRHAasO67qoY20tqw0023thD4f4dZpGYJlQhQobzEgW2O2ut+mKtQWazzROlTntaIg5hsefueWArx5BLDTzKsKIAxLaHW2pA3N/wCr4saSow8pklU5tbXMZ011JN+/PXDacXi1QSONQVyyR5xc+W4a51IuR635Y6KOSCYKGkc59QVy6jsdzoNLe2PY6ad6w5s7ZQSxIBW173Pb8rjBVonh0cbrGkmYPpmAGW9zpe3+3bDscSyyKFCoGHEXKS+UbnfkO+AwLFRENNxIxlJCmwBsLC2+uFlq0acZqoZFQpbUByQCe/QW7aYCuLWJTuacyI6uLs22Uk225i47b74KK95WkWlYs/mvlIKjsLWN+t/piFTgK/xEsN4ljLAuNGsb89b+Wwth6hqI4qjgxgRyQEtfQBr6kk9dsLOH1jRpXlhlRFHzgm+Q/KSCeyjl1641JCHC8JpJOMhsZGJUrvltcAk29vz0y3MiKcykGLyMGAF78ja+gPba+BSxsgdyOFbMymMC2m/2HtiBmnnYgpIWcHQIoICN10va9z19cP0xXJMgjAIAICnysRqbka31B2364h8eoSoaSPOwyILSCxYdWt3+o5Ww3TrUTwx8NJEp82dchswNwCDfbQ/TXDNFW4KegWjE89Q4icgAlbZegA5f11w2IaZ0DQBciZXzXBGUmx09j9eewko8jzK1RLw00LFV8p1210+nTDkDsVkvwnnGr3YqApYkAHpyH6g3x0jFNzkvNwQ140tmFgPzGxwCPh/E/wAFArgZRc+W9+v010B5DAGqsk3w8jqJDYrf8Q5WN+xwq1akZzrUNwRYAKSQzG+Xv0/oYKYV8cCuJuMwzU7fwmiXNlsGBzE8tSemg1x8xUGSlozlklBzZNG8tr9ba6+mPqqOqnkqZ/LJGGQqImIQyNdTmty5DW3LriVVmneaOCaxgjQL5ZAwsNBfp64zZrcqdw5I4jUVNUkJeMWQMXNhm1sLnf8AM7c0KqjLurBhqCCWDEggE6+a4GLEoMUwgVFakijaLMWz3IOpUX25+p7YSzyxspVm40ptd7AkXsLDex64zjSZMDJWcCN2ZVbyZoy1wLciRivPLVTLFFRcSFlW91J4ZFhfS6WN7df1wnW088NSZZKn+Ne5ZRcEjQ6kADS+muuC0oCkSJLwW1AzSADXLfXbkLehw/EtPTvAyE1jPFFGmWy72Ol+9rYYiZ4EZnYKSxK282Q8tdOgwvRFpSSXSVcqjzG179/1w6HvKRNTizLmUqPISDyN+39C5GdZewGYiVVjDcQGxvo179Lc+frg0KvFDItSzLTZSjSLqHJtYXOo19sYpKpopFjYMAWORXFgV68iOuox58PGKmaOoOqDOjCEsctzrfpflvpqLEHG4DjPHP4fLF/FEYQFmj0Y2sToNxbcc9sIJPU8MZYmmbODIjAagAEEix22699MVlhpnjeOCoCBUJF0IaM2ve2nL89tMT81OKeKHz51UHNxPM9+/PfU6Y0y8eeYxyzxwIiXFmZSzIL9OYsL9gNeyVbLUpUmFXyQVEeVr3KEnqP54Zmq2R0jSURiTy8RtSADsdRcm+mgvbAqeYywkGM1BjcqoC5Ax7AnTvjOmJ606UjKq6NmGYK9lD23Lb3y2HPQkdb0qiJM7tAjxGJizMtxnyi9rdbgfTGZaVJYxTxJAsqIOJZ7GwsBpflr9upx5TslFUx0gj4qyMLGVwbgkc9r3G/Xti0pPiFVFHSS/DVE8mdrLG51G/S1+oOuwwt4ajKzxRERmQRsEXzZr3sDzvmF730+hBY6OGFmeqRpaiQCRZeIPMpOth35DfsMexUsUUkl4JIhxEYOcwF9b2IubW/21F7WgYqFI6pYQkZkYZmswIPqTqDr+V8W3iFDTySJIeOiWzKt2JJ2Dcr3Otr64krTxSTM0tQqHObXSxGp/PQ7dMUKpnNOxqJzFOFDpxNnUDe3XW1vfmBgqQVrUnqYtDGS11Asqrbbbnz25Y98MohJVuGaWKU7urAb+o1Hfngc0KtUCWWWIrEOJdD8xvextqCdtBj1hIp4YmvEWswQapY2Fr8tP1xfCZkiEck8TVKyBBcSWzAWtmJvtYW58sOUAVIo1gJdmci9gChHbe++JUEahlkhmIN7sSp0trfvty7Xw3QwrOc5qCrK4sAtgwv06/vjOxLdTC7I09LUtGJMt4wuqEEDTppcadPfBIqdyM7ORGilQzkEtr0tt+eE6SSLMCJ2SAuVUSA5g2hAOmmw37+x8/CdjDLxKYeZ+Cl8o1Oa3Y8r4dZp0LM1QlmVkR2RMvlyAHYeh099saWGqFSZIkBzHKiqSxUaXexuDY/b1wGlnigW7yqchCmVY8x25m9um22nbB6hY5OBNMGFK3kkZkOnMEqdrnnvtfGoDNNPTrUMYXaV3bc2FzzN7XHphSR3h8QkyPN5JGJz8n5Wbc3zW+3bB6Gpp4RxCiroA0Mgsbg2vtcjvjxZIELzmRpeOMqI4KBByve1tTvY/lhFBinqGjSL4ICVWLOHNs25FyLC++uA+I1FWaeWRHYTxSZVygowsemt79e++Go2UIwR2WMDOGkN726bd9Bf0OGZ3CWAk4gbRGUFs5te5PIbYhHzktNxqn4uR7zT2AaPR2a+oAPPLnN9OnPDlHwZaOBuGZGdjwyj/Ith+LlYX0HLa2OqolnkglmRYArqVcOMz6/hN9tb6djhc08tFciDNw2GbUWXSwHl5H0wNPJmjp5BBNPMssYDP/7ZFgNOYOpGnQ4hxs0lZ8Tw2ukgbi5hmIHMXuN9cVfF4465o6uVL0wUZhGwC+ZzqR33wB6ONFXg5rhghXdTrvcC1vfTY4rWitTw5JOM5jJTzZvlJYnzHKSRubn763wjW00kfmjcmJzdbH89PXFiGjhelaZZVOQ5Mj+a55n5tLkX1698L3jZ2FSvmY3Yscmot0uefT+ebSrRrLSxq8qottMobMQL/wC+OFcjz8GEnSQp0LX0GXqNB9sL1yNCnFWN2yMCriIajS1/72ml+3PCb0lpjKU4vlzeZDlF8u+l7g358+WBlZhr2+KYRy8MKLZbgEabHnb98MI8aRyQK7Jm8smZcu4Gh72sPQjEh42N56inhRzZQwk1seVguo9xh6LJEYoQJmsmhXW2rC5zHoB9PTGpVipTPVJSZFBkZFNnU+Y274EgzNcZcytlzAZiALDf+r4TqZHWEtCDGW0cyjUINyqkix+vbBIKimiPCSUgWsxA0Xbc23xWhVKCyrMoKHzhZE62IPt++JVfGjVUKBRlYcNx+FbjXy210vqcHq6+SRWYMWspXOpABN7DTrqvr3xLDAU8dPFHxpiB85uygAAj+eLTIcoJ1kpYjIWdg1+GB8u4H5Eb7DHV1BFVFhChMlv4t20u2l8JQMrwiDgysEW0IDsoVud7G4b7AYYWdY4wjleOsZYgAgNbW509/wB9sGrC9VIsb5ZGNwWJkd8pOoAHtb9sAeESI6STF1Z7uLaA7j6kDB6hqevZRTqI42uwLqCTl0Ivzta3l63v0RSZvi88NyYznDspIY2PI3I/lipGoHAkDiZnI0dn1LC19b48lrGq4REGY3LKVXRydNdNxYnAZalykAa99y6i+a+OjSOCRmVjxAwykknJa5vcbEg26ae2M7CB4ebTxRtGqnVchtmuL3t39emPRCBxJXyEJmXLkAUXOv6C/bAoCHlBcyuWNiANQSR6c7a/rgr0pNVaNSEDA5gwYMAN9Brp79cOkOSOJkDZ2VD5FvqGHW43G317Y3T5F/iXDaEAPz/Y/tjUNOmVZCwezF/KCGsbb7jlpy364do/CyQMpKhQWBYEWNu353/fGU8WBYY2zuwSwsAdSQeY7Yc+JjjQRyTo0m1joOoJvhVaVUicskiqGIIKBrW+U7nLeza+mnVSQGsRm810ulst2y62PO+tv5YRij8UFp4czAFzcmUCxFu++ow+tQvGhklkkL34aOygldDzAtcW+gvyxIELyqY/goBEG1R3y/bKddje3P3wxTcJIXqATdgECAk/iC2F7AmxOv17alZsVaUEySzlxIJBcpvY/wBae2NySPUz5Wa4vor6ggX2J/zYVjkUJmaKQrl+eVbgC2xtv6b88KxT5AxqzGX34apmzAcha52sd+eHRi1fzpBFKElbUl1zhNNr4X8QPFgkd0kQv5IxfLmFjextcbdsZjrQqmMCOQOPwyWIF+ft9MK1FXmlknqb5VOVFzDIxG+18WrGaOUCpX+IIhJEGIVeZsBy5i3TG/GsktEEGYx2yjXRANPXCEcjwMGaEo0ujBNCY77Lcjna5sDYG2uOlgiyuWj/APTZvKhY3bTfW+nT9sF5HGFnVY5UdQyODl1AGwGbToNPbG4yWdXhqAWQlVUnNYm9x+WFiVgzRsFUqMwvc+WwvvbnY7d8ZlyxZY1vIzHVVUkrm5b2JI/IYpSoRU0UDtJIG4hUMDa9v8pPPQDHtPTJVHJTsFmUXd5GuNdbaczffthFZmIVZ1SZY0ygFPK19iba69rajlbBIlo/isk6WjjjsRxLZSSCALcrXxbFh68jUUaOAkYJvn+UryCn2wCWroeGEpADMpBshv67frgavFXxM0HEJzDR1sBrfluDjUkb8GpHw91KHVDfKLfhU6WFr2v17YzU0JKXiSCaQsYiMgQ5ctxt3PS2BvWOyiMOoyEqQTbpr6fnrhaLOipIjSSIykKrAnPc735e4OEWEuYLOVW+oLXGa43JBvfQDBdK9Kz10Zp2njjKrZs76ZtLW97ad8Hjp1SIJNNEGQ5iEXNmbf7Hl++IaIy0mciQkoDGLXytfmb+/XbGoS1RCHrJWJZzZmLG+vTe2mLtRh+WaNr8FhnBuGUjMW6WPb7YyKWdg1VxlDhdFY2sLfbCk68APVQzFmOW8TX83mA2Fj77em+D/Fq6yiWmeO5NzHIQbg77affETFLIojNRL50yhVAFif53vgM5jmKwRI0nERmBUXOUggj1tfFWjlps1uJTOCnlVEse99/zG22E5sryrHCjxtmOec6+X3vb2th+AKHLFDBMjls6545LkIL9DbuOWPGj+KRVjQo6No4/FoRv9cUqeKKlpVYXawuZHILXPPr7DCj1cbypGYbgk6q98uu+oNuXLFUj8AxXpib5fkym4I9cYpY1eGRnLRsD8uW1ydvUWGKlZTO1NcuH5iIlgsYvy1/bEWKOTjIqyFTlL2UFgdTdO3rpjOEaeaHiyPwzFtlaO6qQOnfHs8zpOWjZAXQBybWU9D0P8sDLI6O9TEGQ2u0Ufnj736et8ZeZ4gZR5I3co0iFdBbY4ZpHEjxGZSzpdV1JBYcv2sBh74zIq3XKCT57WJNsBqafws08YaZlZhdQpGQtpqcTQtxNFTyiVlS+QpcEHc37YvUuGugNOXDBFZQJDb5jyPuMagnpmqPIEZit3K3FtPm+v6YgwSERxubh4rkzGS+vYG2vfvgy1gplhWKeCR5Cy6KcwuPxZbXvzxZUs1c6RizFjYXZlHLkb74G0nw9HTyjLThgW4me5Nwdx7/fESVWeJJURDHIbLlbOFH1JvprilT0Qip0+JAhViBny2sdgDpqx6/7YsBiHxCSRTlJCuWunS+pJwenp6VWeYVT8JnIvludbFj63GmNvQU9PUCpYKWcZVZ9btffJsPbA4olZ2jUK6sSRnOgtYEG42w6KcWOkURwIbuzEIsg+bTcfr74TqY+BmzzZ6dQWQEWPYem+HgqZT/HEkq2ZE2AIGpA/o+mEK0A5ODBI+T8AkHynp/QxVSE5XaJkSOQyZlymw6nQfYYEap2qVijjGdAQWO4OOJpWVTVOsWa4UG9gQdxzBwjWywqyyUgyoWs3nuAeu3PfTGfWleKKaaFnniIkBZLfKSdLD0tbXBjEWqFWN1MdwsxdrEH33wCjmmlXjpUCyrlzEAlr69Ntb64zDxVqHKM7Usct3d1BJbewG3vv3GNeguiSQzLI7ISq287aWG2nqcPT1cdQEFSqhioZshAGb3wKvNPDIRIJZDItywYgbncAb6bnXviVWVSRJnEHEXNkBbzHrex5a4z9LyPxGWGNUhj8sZLF1JbP0NidB7Y8q6uum1kjCwg6LIhGYW9NfphRHk4o+JfKua5R1uv/Ltg1aYDCseaMHNcFIgpA9cb2LBYPE6vyBX4WXa1wAb7jTDEdbU09S7OnmfXLqnDv2IvhCjqGpJb0pXMfxMubFiKrYASSJTOT84lcDT01xm31MeHmSJ6iSpYU8WYMXfzIehBVSPvftgZkNVTyMZD/C/sygzFxfpuB20weSurJagvCaUxhbW0svpbCJ8Rqo2CqIbLoQVZQ/sThwPJJ5YnVpCytbLtuCf7u+GaTxSAyESZ3Km4XLe/rfHTeLU8cMYqIDUaHQfhvy1OE5HpZRmjhmAPKyrbGepXnrKd4A4jALb2Ww7bkDCgqrQBmkIy6CQjTve2J6Q0wpgsVQ8c+bXPE7AjtbbGUeviGQpMIr3EnDbKT74bKsUqaY1CrHxwIr+ZioYH/SfMPphqoRxUKqlkjYfMAANNiATrhCmj8QkHGhgzL+JpWVQR3tjD8cMb5VZt2hIP2tgqPl7eSCaUyAZS8ZjAA528wHtcnAPEaWpqHQ8SoW7XzizD/UoGh/1YT488QCxtIQOQOnuLYzNJUTLGjrHlBvmEahh72wy4jcdLWgPEruYm0aRxe/ooP74m1HhNVnmMKyNTh8ysygG3oCbYoQ1UiXR50Kf3Wb+WPJPEEWJo5yhP4TG5uPpi2pNjjjEflqZWVh54zERcjax3+2DwiKNc6Apm+ZZgEv2APzemDUtYsSlUkRQTcrJHlH/Tvh01UMS55GAO96dcp+t74dSBV0tQwFVUFVR/lVgyk+1vTnjMKyRMqIhBYkA5Mx9emPoKTxWhBZKuOaaNj8uS31Ot8M13iFE6xtBFIyq1wjyubemLUWovDHmFOtJSVSZZDnyZiF75m09be2KwiqY4cvFV2aTKQqllsLka23PY/TEwf8SM7cFKeVEH4jKxvjf/ANdRGReIxI1AI1v/AKiftgZp9/C3VP8A083CkBvkdBoT0PL64UrGmhZfigY7t5c0gS50AN9bfe+Bt4i1WjKK5Qx2QykfkbfXC6Q5Y5FdFGcWzo3m9zzwW+mFpqu9TLFIgjkAIjGxzcrlitsNPNQ8CnkrqpXqSDnjSY+X0y31068sI1UbqYwkyuiiyxqwXLjMjyxK6r/BDm+UTZi32wyo0sFJUPIM7yIgDRMsMrtc9NNdcAqI6iWDgnilo3yojU4F77Xa4P20wjLedCzyyPJsUbmOmuGKOaWlRqeNAI5F14yK32w+HDNR4b4pTotqJonDEHKcyHTe9yB05Y8iq5fgjBUAwENmV0Zgc3UgixHocb8Oqx4dxJIDFO7rlMRiK5e6kafbCNZ4jUzyM9YZXW1gitlA9ueHf8WKFJXLFEV+IIYLYZ0UFiNLg5gfbU41ElXW06tIgJv/AGjGxb20xBpp5A1zYADykn5f54peE1k8GfLTioU85IGe3uMFisfQ/wD2pQx6pNUg3/vKfzXHN4THTlglRMcov5gh/wC3HuOxqyMp1QpCXLKT3iT/AMcTaiqMYs0NPIOjxD9Mdjscr9aKjxBEUsKCjuf8LD8mxr41JlBNFSqRtlDf+WOx2Ol+ENlikBZoEv6n98ewxWBaOSSP/I1sdjsc9qFUTy6PWVJHTOP2wzDTMFt8TMwvazEH9MdjsVtwGT4fEpFnlF97NjaUMaNo8nuRj3HYxL6gWp4nzl1zWPUj8sKtBTKCRSp/zv8A+WOx2G8qi0rRr8tPEB01P5nCxlBcjgxC3MLbHmOx04tMPP5iDGp9Sf3wM1ClgrU8TdyW/fHY7HWRVlatiLIioP8ACzfqceisqFY5ZWHvjzHY1ZNDxqye989z1sMeiuqP/c+oGOx2LIhBXz8iBpyFscvilQB5srepb9DjsdikiMQ+KSBhaFATuRJIP+7FKmn+ITNJGL/53P5tj3HYzygMpTQy6uraf42/fDdP4ZSEFuG9xrpK/wC+Ox2MyQKMFHSsn9gv/M374xN4B4fMuZ4mBO9nOOx2GSazAV/4YoAwCtMtx/eBt9Rgkf8Aw/ECQlbWKOgdf/HHY7BZGq//2Q==' },
      { name: 'Venus', size: 0.8, orbit: 15, texturePath: 'data:image/jpeg;base64,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' },
      { name: 'Earth', size: 1, orbit: 20, texturePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-qqRh1kAmA-5aYXVlAazxLDshVMo8tk2vWQ&s' },
      { name: 'Mars', size: 0.7, orbit: 25, texturePath: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/9b7029c3-9717-4658-9066-11c30aa24029/dcsauye-ba810e63-20e3-4ae9-a73c-9201ed87e67d.png/v1/fill/w_1280,h_640,q_80,strp/mars_texture_map__rare_version__by_oleg_pluton_dcsauye-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NjQwIiwicGF0aCI6IlwvZlwvOWI3MDI5YzMtOTcxNy00NjU4LTkwNjYtMTFjMzBhYTI0MDI5XC9kY3NhdXllLWJhODEwZTYzLTIwZTMtNGFlOS1hNzNjLTkyMDFlZDg3ZTY3ZC5wbmciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.bVzQQe3M_FRJKATXUZN-hTsjTNL7-eucoxqWhgYKkvA' },
      { name: 'Jupiter', size: 2, orbit: 35, texturePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_ABVh6X-rxANutcMkEqX0Q6fQtFt7ERZPkQ&s' },
      { name: 'Saturn', size: 1.8, orbit: 45, texturePath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFEBAq2y8p5pY3Q3JR4DE-fAiyFrXeGTj6VA&s' },
    ];

    const planetMeshes = planets.map(planet => {
      const texture = textureLoader.load(planet.texturePath);
      const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({ 
        map: texture,
        metalness: 0.1,
        roughness: 0.8
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.name = planet.name;
      scene.add(mesh);
      return mesh;
    });

    const orbitPaths = planets.map(planet => {
      const orbitGeometry = new THREE.RingGeometry(planet.orbit, planet.orbit + 0.05, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const orbitMesh = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbitMesh.rotation.x = Math.PI / 2;
      scene.add(orbitMesh);
      return orbitMesh;
    });

    // Add Near-Earth Objects
    const nearEarthObjects = [
      { name: 'Near-Earth Asteroids', color: 0xffff00, count: 100 },
      { name: 'Near-Earth Comets', color: 0x00ffff, count: 20 },
      { name: 'Potentially Hazardous Asteroids', color: 0xff0000, count: 50 }
    ];

    nearEarthObjects.forEach(object => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(object.count * 3);
      
      for (let i = 0; i < object.count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const radius = Math.random() * 10 + 20; // Distribute between Earth and Mars orbits
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ color: object.color, size: 0.1 });
      const points = new THREE.Points(geometry, material);
      points.userData.name = object.name;
      scene.add(points);
    });

    const ambientLight = new THREE.AmbientLight(0x404040,20);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 1, 100);
    scene.add(sunLight);

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        setHoveredObject(intersects[0].object.userData.name);
      } else {
        setHoveredObject(null);
      }
    };

    const onClick = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        setSelectedObject(intersects[0].object.userData.name);
      } else {
        setSelectedObject(null);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);

      planetMeshes.forEach((mesh, index) => {
        const planet = planets[index];
        const angle = Date.now() * 0.001 * (1 / planet.orbit);
        mesh.position.x = Math.cos(angle) * planet.orbit;
        mesh.position.z = Math.sin(angle) * planet.orbit;
        mesh.rotation.y += 0.01;
      });

      sun.rotation.y += 0.002;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
      {hoveredObject && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontFamily: 'Arial, sans-serif'
        }}>
          {hoveredObject}
        </div>
      )}
      {selectedObject && (
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '10px',
          fontFamily: 'Arial, sans-serif',
          maxWidth: '300px'
        }}>
          <h2>{selectedObject}</h2>
          <p>{celestialData[selectedObject].description}</p>
          <ul>
            {Object.entries(celestialData[selectedObject]).map(([key, value]) => (
              key !== 'description' && <li key={key}>{key}: {value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Orrery;