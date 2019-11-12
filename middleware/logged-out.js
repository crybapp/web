import { parse } from 'cookieparser'

export default ({ redirect, req }) => {
    if(!req) return
    if(typeof req.headers.cookie !== 'string') return

    const cookies = parse(req.headers.cookie)
    if(cookies.token)
        return redirect('/home')
}
