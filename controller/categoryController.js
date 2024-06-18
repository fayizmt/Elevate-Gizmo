const categoryModel = require("../model/categoryModel")
// const upload = multer({ storage: storage });


const loadCategory = async (req,res) => {
    try {
    const categoryList = await categoryModel.find({});
    console.log(categoryList);
      res.render('categories',{categoryList:categoryList})
      
    } catch (error) {
      console.log(error.message);
    }
  }

  const loadAddCategory = async (req,res) => {
    try {

      res.render('addcategory')
      
    } catch (error) {
      console.log(error.message);
    }
  }

  const addCategory = async (req,res) => {
    try {
       
       console.log(req.body);
       const newCategory = req.body.category
       const newDiscription = req.body.subcategory
       const newImage = req.file.filename
       const existCategory = await categoryModel.findOne({category: newCategory});

       if (existCategory){
        return res.render('addcategory',{message: "Category already exist."})
       }

       const categorySave = new categoryModel({
        category: newCategory,
        description: newDiscription,
        imagepath: newImage,
       })
       const categoryData= await categorySave.save()
       if (categoryData){
        res.redirect('/admin/category');
       }

        
    } catch (error) {
        console.log(error.message);
        throw new Error(error);
        res.status(500).send('Server Error');
    }
};

  

  const loadEditCategory = async (req,res) => {
    try {
      const id = req.query.id;
     
      const categoryData = await categoryModel.findById({ _id: id });
      
      if (categoryData) {
        res.render("editcategory", { categoryData: categoryData });
      } 
      
    } catch (error) {
      console.log(error.message);
      
    }
  }

  const updateCategory = async (req,res) => {
    try {
      if (req.file) {
        const categoryData = await categoryModel.findByIdAndUpdate(
          { _id: req.body.id },
          {
            $set: {
              category: req.body.category,
              description: req.body.description,
              imagepath: req.file.filename,
              is_block: req.body.is_block,
            },
          }
        );
        res.redirect("/admin/category");
        }
        else {
          const categoryData = await categoryModel.findByIdAndUpdate(
            { _id: req.body.id },
            {
              $set: {
                category: req.body.category,
                description: req.body.description,
                imagepath: req.file.filename,
                is_block: req.body.is_block,
              },
            }
          );
        
          res.redirect("/admin/category");
        }
    } catch (error) {
      console.log(error.message);
      throw new Error(error);
    }
  }

 const categoryStatus = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryModel.findById(categoryId);

    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }

    // Toggle the is_block status
    category.is_block = !category.is_block;
    await category.save();

    res.json({ message: `Category ${category.is_block ? 'blocked' : 'unblocked'} successfully`, newStatus: category.is_block });
} catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
}
}; 
module.exports = {
   loadCategory,
   addCategory,
   loadAddCategory,
   loadEditCategory,
   updateCategory,
   categoryStatus
  }