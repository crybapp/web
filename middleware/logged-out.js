export default ({ redirect, store }) => {
    if(store.state.user)
        return redirect('/home')
}
