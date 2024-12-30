const Listing=require("../models/listing");

module.exports.index=async (req, res,next) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
};

module.exports.renderNewForm=(req,res)=> { 
    return res.render("listings/new.ejs");
};

module.exports.showListing =async (req, res, next) => {
    try{
        const { id } = req.params;
        const listing = await Listing.findById(id).populate({
            path:"reviews",
            populate:{
                path:"author",
            },
        })
        .populate("owner");
    
        if(!listing){
            req.flash("success","Listing you requested for does not exist!");
            res.redirect("/listings");
        }
        console.log(listing);
        res.render('listings/show', { listing }); 
    } catch(err){
        next(err);
    }
};

module.exports.createListing=async (req, res,next)=>{
    let url=req.file.path;
    let filename=req.file.filename;
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id;
    newListing.image={url,filename};
    await newListing.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
    
 };

 module.exports.renderEditForm=async(req,res)=>{
    const { id } = req.params;
        let listing = await Listing.findById(id);
        if(!listing){
            req.flash("success","Listing you requested for does not exist!");
            res.redirect("/listings");
        }    

       let originalImageUrl= listing.image.url;
       originalImageUrl=originalImageUrl.replace("/upload","/upload/h_250,w_350");
       res.render("listings/edit.ejs",{listing, originalImageUrl});
};

module.exports.updateListing=async (req,res)=> {
    const { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !== "undefined"){
      let url=req.file.path;
      let filename=req.file.filename;
      listing.image={url,filename};
      await listing.save();
    }

    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing =async (req,res)=>{
    const { id } = req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};