import Admin from "../models/Admin.js";
import { responseReturn } from "../utils/response.js";
import bcrypty from "bcrypt";
import { createToken } from "../utils/tokenCreate.js";
import Seller from "../models/Seller.js";
import SellerCustomer from "../models/chat/SellerCustomerModel.js";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import BO from "./../models/BO.js";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email }).select("+password");

    if (admin) {
      const match = await bcrypty.compare(password, admin.password);
      if (match) {
        const token = await createToken({
          id: admin.id,
          role: admin.role,
        });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 200, { token, message: "Login Successful!" });
      } else {
        responseReturn(res, 404, { error: "Wrong Password" });
      }
    } else {
      responseReturn(res, 404, { error: "Email Not Found!" });
    }
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

export const getUser = async (req, res) => {
  const { id, role } = req;

  try {
    if (role === "admin") {
      const user = await Admin.findById(id);
      responseReturn(res, 200, { userInfo: user });
    } else {
      const seller = await Seller.findById(id);
      responseReturn(res, 200, { userInfo: seller });
    }
  } catch (error) {
    responseReturn(res, 500, { error: "Internal Server Error" });
  }
};

export const sellerRegister = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const getUser = await Seller.findOne({ email });
    if (getUser) {
      responseReturn(res, 404, { error: "Email Already Exists" });
    } else {
      const seller = await Seller.create({
        name,
        email,
        password: await bcrypty.hash(password, 10),
        method: "menualy",
        agencyInfo: {},
      });
      await SellerCustomer.create({
        myId: seller.id,
      });

      const token = await createToken({ id: seller.id, role: seller.role });
      res.cookie("accessToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      responseReturn(res, 201, { token, message: "Register Success!" });
    }
  } catch (error) {
    responseReturn(res, 500, { error: "Internal Server Error" });
  }
};

export const sellerLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const seller = await Seller.findOne({ email }).select("+password");

    if (seller) {
      const match = await bcrypty.compare(password, seller.password);
      if (match) {
        const token = await createToken({
          id: seller.id,
          role: seller.role,
        });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 200, { token, message: "Login Successful!" });
      } else {
        responseReturn(res, 404, { error: "Wrong Password" });
      }
    } else {
      responseReturn(res, 404, { error: "Email Not Found!" });
    }
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

export const createSellerProfile = async (req, res) => {
  const { id } = req;
  const form = formidable({ multiples: true });

  form.parse(req, async (err, field, files) => {
    let {
      name,
      username,
      description,
      industryExpertise,
      mainAISpecializations,
      aiTools,
      teamSize,
      pricingModel,
      targetBusinessSize,
      previousProjects,
      location,
      additionalInfo,
    } = field;
    let { images } = files;
    name = name.trim();

    cloudinary.config({
      cloud_name: process.env.cloud_name,
      api_key: process.env.api_key,
      api_secret: process.env.api_secret,
      secure: true,
    });

    try {
      const existingUser = await Seller.findOne({
        "agencyInfo.username": username,
      });
      if (existingUser) {
        return responseReturn(res, 400, { error: "Username already exists" });
      }

      let imageUrl = [];

      if (!Array.isArray(images)) {
        images = [images];
      }

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i].filepath, {
          folder: "aaprofiles",
        });
        imageUrl.push(result.url);
      }

      await Seller.findByIdAndUpdate(id, {
        agencyInfo: {
          name,
          username,
          description: description.trim(),
          industryExpertise,
          mainAISpecializations,
          aiTools,
          teamSize,
          pricingModel,
          targetBusinessSize,
          previousProjects,
          location,
          additionalInfo,
          agencyLogo: imageUrl,
        },
      });
      const userInfo = await Seller.findById(id);
      responseReturn(res, 201, {
        message: "Profile Info Added Successfully",
        userInfo,
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  });
};

export const updateUserImage = async (req, res) => {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, field, files) => {
    const { oldImage, userId } = field;
    const { newImage } = files;

    if (err) {
      responseReturn(res, 400, { error: err.message });
    } else {
      try {
        cloudinary.config({
          cloud_name: process.env.cloud_name,
          api_key: process.env.api_key,
          api_secret: process.env.api_secret,
          secure: true,
        });

        const result = await cloudinary.uploader.upload(newImage.filepath, {
          folder: "aaprofiles",
        });

        if (result) {
          let seller = await Seller.findById(userId);
          if (!seller) {
            responseReturn(res, 404, { error: "Seller not found" });
          }

          let { agencyInfo } = seller;
          if (!agencyInfo.agencyLogo) {
            agencyInfo.agencyLogo = [];
          }

          const index = agencyInfo.agencyLogo.findIndex(
            (img) => img === oldImage
          );
          agencyInfo.agencyLogo[index] = result.url;
          await Seller.findByIdAndUpdate(userId, { agencyInfo });

          seller = await Seller.findById(userId);
          responseReturn(res, 200, {
            seller,
            message: "Agency Logo Updated Successfully",
          });
        } else {
          responseReturn(res, 404, { error: "Agency Logo Upload Failed" });
        }
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    }
  });
};

export const updateSeller = async (req, res) => {
  const { id } = req;
  let {
    agenname,
    name,
    email,
    username,
    description,
    industryExpertise,
    mainAISpecializations,
    aiTools,
    teamSize,
    pricingModel,
    targetBusinessSize,
    previousProjects,
    location,
    additionalInfo,
    userId,
    agencyLogo,
  } = req.body;

  try {
    const seller = await Seller.findById(userId);

    if (!seller) {
      return responseReturn(res, 404, { error: "User not found" });
    }

    if (seller._id.toString() !== id) {
      return responseReturn(res, 403, {
        error: "Unauthorized: You cannot update this user",
      });
    }

    name = name.trim();

    try {
      await Seller.findByIdAndUpdate(userId, {
        name,
        email,
        agencyInfo: {
          name: agenname,
          username,
          description,
          industryExpertise,
          mainAISpecializations,
          aiTools,
          teamSize,
          pricingModel,
          targetBusinessSize,
          previousProjects,
          location,
          additionalInfo,
          agencyLogo: [agencyLogo],
        },
      });

      const seller = await Seller.findById(userId);
      responseReturn(res, 200, {
        seller,
        message: "User Updated Successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword, userId } = req.body;
  const { id } = req;

  try {
    const seller = await Seller.findById(userId).select("+password");

    if (!seller) {
      return responseReturn(res, 404, { error: "User not found" });
    }

    if (seller._id.toString() !== id) {
      return responseReturn(res, 403, {
        error: "Unauthorized: You cannot change the password",
      });
    }

    const isMatch = await bcrypty.compare(currentPassword, seller.password);

    if (!isMatch) {
      return responseReturn(res, 400, {
        error: "Current password is incorrect",
      });
    }

    if (newPassword !== confirmPassword) {
      return responseReturn(res, 400, { error: "New passwords do not match" });
    }

    if (newPassword.length < 6) {
      return responseReturn(res, 400, {
        error: "Passowrd must be atleast 6 characters long",
      });
    }

    const hashedPassword = await bcrypty.hash(newPassword, 10);
    await Seller.findByIdAndUpdate(userId, { password: hashedPassword });

    responseReturn(res, 200, { message: "Password changed successfully" });
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

export const getSellerProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await Seller.findOne({ "agencyInfo.username": username });
    responseReturn(res, 200, { user });
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

export const getSellerProfileFromId = async (req, res) => {
  const { sellerId } = req.params;

  try {
    const user = await Seller.findOne({ _id: sellerId });
    responseReturn(res, 200, { user });
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};
