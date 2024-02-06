exports.get404Page = (req, res, next) => {
    res.status(404).render("404", { currentUser: req.user, PageTitle: "Page not found", Path: "/404", csrfToken: req.csrfToken()})
}

exports.get500Page = (req, res, next) => {
    res.status(400).render("400", { currentUser: req.user, PageTitle: "An Error Occured", Path: "/500", csrfToken: req.csrfToken()})
}