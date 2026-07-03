import jwt from "jsonwebtoken";

const isLocalHost = (hostName = "") => {
  const normalizedHost = hostName.toLowerCase();

  return ["localhost", "127.0.0.1", "::1"].includes(normalizedHost);
};

const createTokenAndSaveCookie = (userId, res, req) => {
  const token = jwt.sign({ userId }, process.env.JWT_TOKEN, {
    expiresIn: "10d",
  });

  const isProduction = process.env.NODE_ENV === "production";
  const requestHost = req?.hostname || req?.host || req?.headers?.host?.split(":")[0] || "";
  const useSecureCookie = isProduction && !isLocalHost(requestHost);

  res.cookie("jwt", token, {
    httpOnly: true, //protects from xssl attack
    secure: useSecureCookie,
    sameSite: useSecureCookie ? "strict" : "lax", // strict in production, workable on local HTTP
  });
};

export default createTokenAndSaveCookie;
