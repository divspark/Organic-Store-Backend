import nlp from "compromise";

// Define enum for units of measurement
export const Unit = {
  KILOGRAM: "kilogram",
  KG: "kg",
  GRAMS: "grams",
  G: "g",
  POUNDS: "pounds",
  LBS: "lbs",
  PIECES: "pieces",
  PCS: "pcs",
};

// Product dataset dictionary
const productDatabase = {
  aalu: {
    name: "aalu",
    photo: "https://cdn.mos.cms.futurecdn.net/iC7HBvohbJqExqvbKcV3pP-650-80.jpg.webp",
    price: "2.50",
  },
  pyaj: {
    name: "pyaj",
    photo: "https://img.etimg.com/thumb/msid-107845571,width-300,height-225,imgsize-178900,resizemode-75/how-to-shop-and-store-onion.jpg",
    price: "2.50",
  },
  tamatar: {
    name: "tamatar",
    photo: "https://m.media-amazon.com/images/I/51zGJKaNDRL.jpg",
    price: "2.50",
  },
};

export const parseSpeechInput = (input) => {
  if (!input) return null;

  const doc = nlp(input);
  const values = doc.values().toNumber().out("text");
  const units = doc.match("#Unit").out("text");
  const productName = doc.not(doc.values()).not(units).out("text").trim();

  let resolvedUnits = units;
  if (!resolvedUnits) {
    const unitMatch = input.match(new RegExp(Object.values(Unit).join("|"), "i"));
    resolvedUnits = unitMatch ? unitMatch[0] : Unit.PIECES;
  }

  let resolvedQuantity = values;
  if (!resolvedQuantity) {
    const quantityMatch = input.match(/\d+/);
    resolvedQuantity = quantityMatch ? quantityMatch[0] : "1";
  }

  return {
    product_name: productName.trim(),
    quantity: resolvedQuantity.trim(),
    unit: resolvedUnits.trim(),
  };
};

export const findProductFromVoice = (productName) => {
  if (!productName) return null;
  return productDatabase[productName.toLowerCase()] || null;
};

export const processVoiceQuery = (userInput) => {
  const parsedData = parseSpeechInput(userInput);
  if (!parsedData) return null;

  const productData = findProductFromVoice(parsedData.product_name);
  if (!productData) return null;

  return {
    name: productData.name,
    stock: `${parsedData.quantity} ${parsedData.unit}`,
    photo: productData.photo,
    price: productData.price,
  };
};
