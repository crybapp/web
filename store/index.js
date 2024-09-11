import { parse } from 'cookieparser'
import cookies from 'browser-cookies'

const isProduction = () => process.env.NODE_ENV === 'production'

export const getters = {
    user: ({ user }) => user,
    userId: ({ userId }) => userId,

    users: ({ users }) => users,

    onlineUsers: ({ users, onlineUsers }) => {
        return onlineUsers ? [
            ...new Set(
                onlineUsers
                    .map(id => users[id] || null)
                    .filter((user, i) => user !== null && onlineUsers.indexOf(user.id) >= i)
            )
        ] : []
    },
    onlineUserIds: ({ onlineUsers }) => onlineUsers ? [...new Set(onlineUsers)] : [],
    typingUsers: ({ users, userId, typingUsers }) => {
        return [
            ...new Set(
                typingUsers
                .map(id => users[id] || null)
                .filter(user => user.id !== userId && user !== null)
            )
        ]
    },

    token: ({ token }) => token,

    room: ({ room }) => room,
    sendingMessages: ({ sendingMessages }) => sendingMessages,

    portal: ({ portal }) => portal,

    messages: ({ room }) => room ? (room.messages || []) : [],
    controllerId: ({ controllerId }) => controllerId,

    queueStatus: ({ queueStatus }) => queueStatus,

    janusId: ({ janusId }) => janusId,
    janusIp: ({ janusIp }) => janusIp,

    viewerMuted: ({ viewerMuted }) => viewerMuted,
    viewerVolume: ({ viewerVolume }) => (viewerVolume / 100),
    controlLocked: ({ controlLocked }) => controlLocked,
    fullscreen: ({ fullscreen }) => fullscreen,
    pip: ({ pip }) => pip,

    ws: ({ ws }) => ws,
    wsHeartbeat: ({ wsHeartbeat }) => wsHeartbeat
}

const initialState = () => ({
    user: null,
    userId: null,

    users: {},
    token: null,

    room: null,
    controllerId: null,
    onlineUsers: [],

    portal: null,

    typingUsers: [],
    sendingMessages: [],

    queueStatus: null,

    janusId: null,
    janusIp: null,

    viewerMuted: false,
    viewerVolume: 30,
    controlLocked: false,
    fullscreen: false,
    pip: false,

    ws: null,
    wsHeartbeat: null,
    wsReconnect: null,
    wsReconnectInterval: 5000
})

export const state = () => initialState()

export const mutations = {
    /**
     * User / Self User
     */
    handleUser(state, user) {
        state.users[user.id] = user
    },

    handleSelfUser(state, user) {
        state.user = user
        state.users[user.id] = user
    },

    handleUserId(state, userId) {
        state.userId = userId
    },

    handleToken(state, { token, save }) {
        state.token = token

        this.$axios.setHeader('Authorization', `Bearer ${token}`)

        if (token && save && process.client)
            cookies.set('token', token, {
                expires: 365,
                domain: process.env.COOKIE_DOMAIN,
                secure: isProduction() || window.isSecureContext
            })
        else if (save && process.client)
            cookies.erase('token', {
                domain: process.env.COOKIE_DOMAIN
            })
    },

    /**
     * Room
     */
    handleRoom(state, room) {
        if (room) {
            state.room = room
            state.user.room = room

            state.typingUsers = []
            state.onlineUsers = room.online

            if (room.portal)
                state.portal = room.portal

            if (!room.messages)
                state.room.messages = []

            if (room.controller)
                if (typeof room.controller === 'string')
                    state.controllerId = room.controller
                else
                    state.controllerId = room.controller.id
            else
                state.controllerId = null

            if (state.onlineUsers && state.onlineUsers.indexOf(state.userId) === -1)
                state.onlineUsers.push(state.userId)

            if (room.members)
                room.members.forEach(member => this.commit('handleUser', member))
        } else {
            state.room = null
            state.user.room = null

            state.portal = null

            state.typingUsers = []
            state.onlineUsers = []
            state.controllerId = null

            state.janusId = null
            state.janusIp = null
        }
    },

    /**
     * Portal
     */
    updatePortal(state, allocation) {
        if (!state.room)
            return

        state.portal = allocation
        state.room.portal = allocation

        if (allocation.status === 'creating' || allocation.status === 'starting' || allocation.status === 'open')
            this.commit('updateQueueStatus', null)
    },

    /**
     * QueueStatus
     */
    updateQueueStatus(state, status) {
        if (!state.room)
            return

        // ToDo: NUKE THIS ASAP
        if (state.portal.status === 'waiting' && status !== null)
            state.portal.status = 'in-queue'

        state.queueStatus = status
    },

    /**
     * Janus
     */
    updateJanus(state, config) {
        if (!state.room)
            return

        state.janusId = config.id
        state.janusIp = config.ip
    },

    /**
     * Viewer State
     */
    setMutedStatus(state, isMuted) {
        state.viewerMuted = isMuted
    },
    setViewerVolume(state, newVolume) {
        state.viewerVolume = newVolume

        if (process.browser)
            localStorage.setItem('volume', newVolume)
    },
    setControlLockStatus(state, isLocked) {
        state.controlLocked = isLocked
    },

    setFullscreenStatus(state, status) {
        state.fullscreen = status
    },
    setPiPStatus(state, status) {
        state.pip = status
    },

    /**
     * Invite
     */
    handleInvite(state, invite) {
        if (!state.room)
            return

        state.room.invites = [ invite ]
    },

    /**
     * Messages
     */
    pushMessage(state, message) {
        if (!state.room)
            return

        if (!state.room.messages)
            state.room.messages = []

        const lastGroup = state.room.messages[state.room.messages.length - 1], { id, author } = message

        if (message.author === state.userId)
            state.sendingMessages.splice(state.sendingMessages.indexOf(message.content), 1)
        else
            this.commit('updateTypingStatus', { u: message.author, typing: false })

        if (lastGroup && lastGroup.author === author) {
            state.room.messages[state.room.messages.length - 1].messages.push(message)
            state.room.messages[state.room.messages.length - 1].messageIds.push(message.id)
        } else
            state.room.messages.push({
                id, author,
                messages: [message],
                messageIds: [id]
            })
    },

    pushSendingMessage(state, { content }) {
        state.sendingMessages.push(content)
    },

    pullMessage(state, messageId) {
        if (!state.room || state.room.messages.length === 0)
            return

        const messageIds = state.room.messages.map(({ messageIds }) => messageIds)

        let groupMessageIndex = -1, groupIndex = -1

        messageIds.forEach((ids, i) => {
            if (groupIndex > -1 && groupMessageIndex > -1)
                return

            groupIndex = i
            groupMessageIndex = ids.indexOf(messageId)
        })

        state.room.messages[groupIndex].messages.splice(groupMessageIndex, 1)
        state.room.messages[groupIndex].messageIds.splice(groupMessageIndex, 1)

        if (state.room.messages[groupIndex].messages.length === 0)
            state.room.messages.splice(groupIndex, 1)
    },

    /**
     * Room User State
     */
    handleUserJoin(state, user) {
        state.users[user.id] = user

        if (state.room && state.room.members.indexOf(user.id) === -1)
            state.room.members.push(user)
    },

    handleUserLeave(state, { u: userId }) {
        if (state.userId === userId)
            return

        if (state.room) {
            const memberIndex = state.room.members.map(({ id }) => id).indexOf(userId)
            state.room.members.splice(memberIndex, 1)
        }

        if (state.onlineMembers)
            state.onlineMembers.splice(state.onlineMembers.indexOf(userId), 1)
    },

    handleOwnerUpdate(state, { u: userId }) {
        if (!state.room)
            return

        const user = state.users[userId]
        if (!user)
            return state.room.owner = userId

        state.room.owner = user
    },

    /**
     * Typing
     */
    setTypingStatus(state, typing) {
        if (!state.ws || state.ws.readyState !== state.ws.OPEN)
            return

        state.ws.send(JSON.stringify({ op: 0, d: { typing }, t: 'TYPING_UPDATE' }))
    },

    updateTypingStatus(state, { typing, u: userId }) {
        if (userId === state.userId)
            return

        if (typing)
            state.typingUsers.push(userId)
        else
            state.typingUsers.splice(state.typingUsers.indexOf(userId), 1)
    },

    /**
     * Presence
     */
    updatePresence(state, { u: userId, presence }) {
        if (userId === state.userId)
            return

        if (presence === 'online' && state.onlineUsers.indexOf(userId) === -1)
            state.onlineUsers.push(userId)
        else
            state.onlineUsers.splice(state.onlineUsers.indexOf(userId), 1)
    },

    /**
     * Controller
     */
    updateController(state, { u: controllerId }) {
        state.controllerId = controllerId
    },

    /**
     * Cookies
        */
    allowCookies(state, { save } = { save: true }) {
        if (save && process.client)
            cookies.set('cookies', '1', {
                expires: 365 * 10, // 10 years
                domain: process.env.COOKIE_DOMAIN,
                secure: isProduction() || window.isSecureContext
            })
    },

    /**
     * WebSocket
     */
    setupWebSocket(state) {
        if (!state.token)
            return

        const { token } = state, ws = new WebSocket(process.env.WS_URL)

        if (state.wsReconnect)
            this.commit('invalidateReconnect')

        ws.onclose = ws.onerror = () => setTimeout(() => this.commit('setupReconnect'), 50)

        ws.onmessage = ({ data }) => {
            let json

            try {
                json = JSON.parse(data)
            } catch(error) {
                return console.error(error)
            }

            const { op, d, t } = json

            if (op !== 11 && !isProduction())
                console.log(op, d, t)

            if (op === 0) {
                if (t.split('_')[0] === 'PORTAL')
                    return this.commit('updatePortal', d)
                switch (t) {
                    // ROOM
                    case 'CONTROLLER_UPDATE':
                        this.commit('updateController', d)
                        break
                    case 'QUEUE_UPDATE':
                        this.commit('updateQueueStatus', d)
                        break
                    case 'JANUS_CONFIG':
                        this.commit('updateJanus', d)
                        break
                    case 'ROOM_DESTROY':
                        this.commit('handleRoom', null)
                        break
                    case 'INVITE_UPDATE':
                        this.commit('handleInvite', d)
                        break
                    // USER
                    case 'USER_JOIN':
                        this.commit('handleUserJoin', d)
                        break
                    case 'USER_UPDATE':
                        this.commit('handleUser', d)
                        break
                    case 'USER_LEAVE':
                        this.commit('handleUserLeave', d)
                        break
                    case 'OWNER_UPDATE':
                        this.commit('handleOwnerUpdate', d)
                        break
                    case 'PRESENCE_UPDATE':
                        this.commit('updatePresence', d)
                        break
                    // MESSAGE
                    case 'MESSAGE_CREATE':
                        this.commit('pushMessage', d)
                        break
                    case 'MESSAGE_DESTROY':
                        this.commit('pullMessage', d.id)
                        break
                    case 'TYPING_UPDATE':
                        this.commit('updateTypingStatus', d)
                        break
                }
            } else if (op === 10) {
                const { c_heartbeat_interval, c_reconnect_interval } = d

                this.commit('setupHeartbeat', c_heartbeat_interval)
                state.wsReconnectInterval = c_reconnect_interval

                ws.send(JSON.stringify({ op: 2, d: { token } }))
            }
        }

        state.ws = ws
    },

    disconnectWebSocket(state) {
        if (state.ws) {
            state.ws.close(1000)
            state.ws = null
        }

        state.controllerId = null
        state.typingUsers = []
        state.onlineMembers = []
        state.janusId = null
        state.janusIp = null

        if (state.wsHeartbeat)
            this.commit('invalidateHeartbeat')

        if (state.wsReconnect)
            this.commit('invalidateReconnect')
    },

    setupHeartbeat(state, interval) {
        state.wsHeartbeat = setInterval(() => {
            if (!state.ws || state.ws.readyState !== state.ws.OPEN)
                return this.commit('invalidateHeartbeat')

            state.ws.send(JSON.stringify({ op: 1, d: {} }))
        }, interval)
    },

    invalidateHeartbeat(state) {
        if (!state.wsHeartbeat)
            return

        clearInterval(state.wsHeartbeat)
        state.wsHeartbeat = null
    },

    setupReconnect(state) {
        if (!state.ws || state.wsReconnect)
            return

        this.commit('disconnectWebSocket')

        state.wsReconnect = setInterval(() => {
            if (state.ws)
                if (state.ws.readyState === state.ws.OPEN)
                    return this.commit('invalidateReconnect')

            this.commit('setupWebSocket')
        }, state.wsReconnectInterval)
    },

    invalidateReconnect(state) {
        if (!state.wsReconnect)
            return

        clearInterval(state.wsReconnect)
        state.wsReconnect = null
    },

    logout(_state) {
        if (_state.ws)
            this.commit('disconnectWebSocket')

        const state = initialState()

        if (process.client)
            cookies.erase('token', {
                domain: process.env.COOKIE_DOMAIN
            })
    }
}

export const actions = {
    async fetchUser({ commit }) {
        try {
            const user = await this.$axios.$get('user/me')

            commit('handleSelfUser', user)
            commit('handleUserId', user.id)
            commit('handleRoom', user.room)
        } catch(error) {
            if (error.response && error.response.data && error.response.data.response === 'USER_NO_AUTH')
                commit('logout')
            else
                console.error(error)
        }
    },

    async fetchRoom({ commit }) {
        try {
            const room = await this.$axios.$get('room')

            commit('handleRoom', room)
        } catch(error) {
            console.error(error)
        }
    },

    async leaveRoom({ commit }) {
        try {
            await this.$axios.$post('room/leave')

            commit('handleRoom', null)
        } catch(error) {
            console.error(error)

            if (error && error.response && error.response.status === 410)
                commit('handleRoom', null)
        }
    },

    async takeControl({ state, commit }) {
        try {
            await this.$axios.$post('room/controller/take')

            commit('updateController', { u: state.userId })
        } catch(error) {
            console.error(error)
        }
    },

    async giveControl({ commit }, userId) {
        try {
            await this.$axios.$post(`/room/controller/give/${userId}`)

            commit('updateController', { u: userId })
        } catch(error) {
            console.error(error)
        }
    },

    async releaseControl({ commit }) {
        try {
            await this.$axios.$post('room/controller/release')

            commit('updateController', { u: null })
        } catch(error) {
            console.error(error)
        }
    },

    async nuxtClientInit({ commit }) {
        const token = cookies.get('token')

        if (token) {
            commit('handleToken', { token, save: false })
            if (!this.user)
               await this.dispatch('fetchUser')
        }
    },

    async nuxtServerInit({ commit }, { req }) {
        if (!req || typeof req.headers.cookie !== 'string')
            return

        const { token } = parse(req.headers.cookie)

        if (token) {
            commit('handleToken', { token, save: false })
            await this.dispatch('fetchUser')
        }
    }
}
