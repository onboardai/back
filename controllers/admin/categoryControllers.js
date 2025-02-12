import Category from "../../models/Category.js";
import { responseReturn } from "../../utils/response.js";

export const addCategory = async (req, res) => {
  console.log("add category");
};

export const getCategory = async (req, res) => {
  const { page, searchValue, parPage } = req.query;

  try {
    let skipPage = "";
    if (parPage && page) {
      skipPage = parseInt(parPage) * (parseInt(page) - 1);
    }

    if (searchValue && page && parPage) {
      const categories = await Category.find({
        $text: { $search: searchValue },
      })
        .skip(skipPage)
        .limit(parPage)
        .sort({ num: -1 });
      const totalCategory = await Category.find({
        $text: { $search: searchValue },
      }).countDocuments();
      responseReturn(res, 200, { categories, totalCategory });

    } else if (searchValue === "" && page && parPage) {
      const categories = await Category.find({})
        .skip(skipPage)
        .limit(parPage)
        .sort({ num: -1 });
      const totalCategory = await Category.find({}).countDocuments();
      responseReturn(res, 200, { categories, totalCategory });

    } else {
      const categories = await Category.find({})
        .sort({ num: -1 });
      const totalCategory = await Category.find({}).countDocuments();
      responseReturn(res, 200, { categories, totalCategory });

    }
  } catch (error) {
    console.log(error.message);
  }
};
