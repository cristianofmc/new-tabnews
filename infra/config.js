function getOrigin() {
  if (["test", "development"].includes(process.env.NODE_ENV)) {
    return "http://localhost:3000";
  }
  if (process.env.VERCEL_ENV === "preview") {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "https://tab-news.cristianofelipe.com";
}

function getAppName() {
  return process.env.APP_NAME || "Cristiano Felipe Connection";
}

function getContactEmail() {
  return process.env.APP_CONTACT_EMAIL || "contact@cristianofelipe.com";
}

const config = {
  origin: getOrigin(),
  appName: getAppName(),
  appEmail: getContactEmail(),
};

export default config;
