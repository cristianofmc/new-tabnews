function Home() {
  let timer;

  const reveal = () => {
    const t = document.getElementById("text");
    t.style.opacity = "1";
    t.style.filter = "blur(0px)";

    clearTimeout(timer);
    timer = setTimeout(() => {
      t.style.opacity = "0";
      t.style.filter = "blur(8px)";
    }, 1200);
  };

  return (
    <div
      onMouseMove={reveal}
      style={{
        height: "100vh",
        background: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        id="text"
        style={{
          color: "#f2f6ff",
          opacity: 0,
          filter: "blur(8px)",
          transition: "opacity .5s ease, filter .5s ease",
          textShadow: "0 0 25px #050a1a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        under construction
      </h1>
    </div>
  );
}

export default Home;
