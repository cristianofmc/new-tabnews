function Home() {
  const message = (e) => {
    document.getElementById("dial").showModal();
  };

  return (
    <div>
      <h3>Você tem uma mensagem especial:</h3>
      <dialog id="dial">De: Felipe, para: Arlene; eu te amo!</dialog>

      <button onClick={message}>Ver mensagem</button>
    </div>
  );
}

export default Home;
