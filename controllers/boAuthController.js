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

export const boRegister = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const bo = await BO.findOne({ email });
    if (bo) {
      responseReturn(res, 404, { error: "Email Already Exists" });
    } else {
      const createBO = await BO.create({
        name: name.trim(),
        email: email.trim(),
        password: await bcrypty.hash(password, 10),
        method: "menualy",
      });
      await SellerCustomer.create({
        myId: createBO.id,
      });
      const token = await createToken({
        id: createBO.id,
        name: createBO.name,
        email: createBO.email,
        method: createBO.method,
      });
      res.cookie("boToken", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      responseReturn(res, 201, { message: "User Regisered", token });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const createBOProfile = async (req, res) => {
  const { id } = req;
  const form = formidable({ multiples: true });

  form.parse(req, async (err, field, files) => {
    let {
      name,
      username,
      description,
      industry,
      aiNeeds,
      aiExpectations,
      businessSize,
      budgetRange,
      aiIntegrationLevel,
      previousImplementations,
      location,
      additionalInfo,
      userId,
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
      const existingUser = await BO.findOne({
        "businessInfo.username": username,
      });

      if (existingUser) {
        return responseReturn(res, 400, { error: "Username already exists" });
      }

      const bo = await BO.findById(userId);

      if (bo._id.toString() !== id) {
        return responseReturn(res, 403, {
          error: "Unauthorized: You cannot create profile",
        });
      }

      let imageUrl = [];

      if (!Array.isArray(images)) {
        images = [images];
      }

      for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.uploader.upload(images[i].filepath, {
          folder: "boprofiles",
        });
        imageUrl.push(result.url);
      }

      await BO.findByIdAndUpdate(id, {
        businessInfo: {
          name,
          username,
          description: description.trim(),
          industry,
          aiNeeds,
          aiExpectations,
          businessSize,
          budgetRange,
          aiIntegrationLevel,
          previousImplementations,
          location,
          additionalInfo,
          businessLogo: imageUrl,
        },
      });
      const userInfo = await BO.findById(id);
      responseReturn(res, 201, {
        message: "Profile Info Added Successfully",
        userInfo,
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  });
};

export const getBO = async (req, res) => {
  const { id } = req;

  try {
    const bo = await BO.findById(id);
    responseReturn(res, 200, { userInfo: bo });
  } catch (error) {
    responseReturn(res, 500, { error: "Internal Server Error" });
  }
};

export const boLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const bo = await BO.findOne({ email }).select("+password");
    if (bo) {
      const match = await bcrypty.compare(password, bo.password);
      if (match) {
        const token = await createToken({
          id: bo.id,
          name: bo.name,
          email: bo.email,
          method: bo.method,
        });
        res.cookie("boToken", token, {
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        responseReturn(res, 201, { message: "User Login Successful", token });
      } else {
        responseReturn(res, 404, { error: "Wrong Password" });
      }
    } else {
      responseReturn(res, 404, { error: "Email Not Found" });
    }
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

export const updateBOImage = async (req, res) => {
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
          folder: "boprofiles",
        });

        if (result) {
          let bo = await BO.findById(userId);
          if (!bo) {
            responseReturn(res, 404, { error: "User not found" });
          }

          let { businessInfo } = bo;
          if (!businessInfo.businessLogo) {
            businessInfo.businessLogo = [];
          }

          const index = businessInfo.businessLogo.findIndex(
            (img) => img === oldImage
          );
          businessInfo.businessLogo[index] = result.url;
          await BO.findByIdAndUpdate(userId, { businessInfo });

          bo = await BO.findById(userId);
          responseReturn(res, 200, {
            bo,
            message: "Business Logo Updated Successfully",
          });
        } else {
          responseReturn(res, 404, { error: "Business Logo Upload Failed" });
        }
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    }
  });
};

export const updateBO = async (req, res) => {
  const { id } = req;
  let {
    name,
    bName,
    email,
    username,
    description,
    industry,
    aiNeeds,
    aiExpectations,
    businessSize,
    budgetRange,
    aiIntegrationLevel,
    previousImplementations,
    location,
    additionalInfo,
    userId,
    businessLogo,
  } = req.body;

  try {
    const bo = await BO.findById(userId);

    if (!bo) {
      return responseReturn(res, 404, { error: "User not found" });
    }

    const find = await BO.findOne({ username });

    if (find) {
      return responseReturn(res, 404, { error: "Username must be unique" });
    }

    if (bo._id.toString() !== id) {
      return responseReturn(res, 403, {
        error: "Unauthorized: You cannot update this user",
      });
    }

    name = name.trim();

    try {
      await BO.findByIdAndUpdate(userId, {
        name,
        email,
        businessInfo: {
          name: bName,
          username,
          description,
          industry,
          aiNeeds,
          aiExpectations,
          businessSize,
          budgetRange,
          aiIntegrationLevel,
          previousImplementations,
          location,
          additionalInfo,
          userId,
          businessLogo: [businessLogo],
        },
      });

      const bo = await BO.findById(userId);
      responseReturn(res, 200, {
        bo,
        message: "User Updated Successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

export const changePasswordBO = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword, userId } = req.body;
  const { id } = req;

  try {
    const bo = await BO.findById(userId).select("+password");

    if (!bo) {
      return responseReturn(res, 404, { error: "User not found" });
    }

    if (bo._id.toString() !== id) {
      return responseReturn(res, 403, {
        error: "Unauthorized: You cannot change the password",
      });
    }

    const isMatch = await bcrypty.compare(currentPassword, bo.password);

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
    await BO.findByIdAndUpdate(userId, { password: hashedPassword });

    responseReturn(res, 200, { message: "Password changed successfully" });
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
};

export const getBOProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await BO.findOne({ "businessInfo.username" : username });
    responseReturn(res, 200, { user });
  } catch (error) {
    responseReturn(res, 500, { error: error.message });
  }
}