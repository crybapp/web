export default ({ redirect, route, store }) => {
    if (store.state.user)
        if (route.query.state)
            return redirect(`/i/${route.query.state.split('=')[1]}`)
        else
            return redirect('/home')
}
