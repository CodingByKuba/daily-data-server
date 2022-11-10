const models = require('../models')
const utils = require('../utils')
const { v4: uuidv4 } = require('uuid');
const constants = require('../constants')

//SPRAWDZANIE POPRAWNOŚCI LOGOWANIA
const checkLogin = async (data) => {
  try {
    if(!data.username || !data.password) throw ("Nie podano wystarczających argumentów")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(data.password === user.password) return true
    else throw (`Podano nieprawidłowe hasło`)

  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${checkLogin.name}] ${error}`)
    return { error: error }
  }
}

//POBIERANIE DANYCH UŻYTKOWNIKA
const getUser = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)
    return user
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${getUser.name}] ${error}`)
    return { error: error }
  }
  
}

//TWORZENIE NOWEGO UŻYTKOWNIKA
const newUser = async (data) => {
  try {
      if(!data.username || !data.password) throw ("Nie podano wystarczających argumentów")
      if(utils.checkSymbols(data.username, "nick") === false) throw ("Nazwa użytkownika zawiera nieprawidłowe znaki")
      if(utils.checkSymbols(data.password, "nick") === false) throw ("Hasło zawiera nieprawidłowe znaki")
      if(data.username.length < 3 || data.username.length > 20) throw ("Nazwa użytkownika musi zawierać od 3 do 20 znaków")
      if(data.password.length < 3 || data.password.length > 30) throw ("Hasło musi zawierać od 3 do 30 znaków")

      let user = await models.User.findOne({ username: data.username })
      
      if(user) throw (`Użytkownik "${user.username}" już istnieje`)

      return await models.User.create(
          {
              username: data.username,
              password: data.password,
              weatherCity: null
          }
      )
  } catch (error) {
      constants.DEBUG_MODE === true && console.log(`[${newUser.name}] ${error}`)
      return { error: error }
  }
}

//EDYCJA UŻYTKOWNIKA PO NAZWIE
const updateUser = async (data) => {
  try {
      if(!data.username) throw ("Nie podano nazwy użytkownika")

      let user = await models.User.findOne({ username: data.username })
      if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

      if(data.weatherCity && isNaN(data.weatherCity)) throw ("Podane miasto dla widgetu pogodowego jest nieprawidłowe")

      let newPassword = false
      if(data.password && data.oldPassword) {
        if(data.password.length < 3 || data.password.length > 30) throw ("Hasło musi zawierać od 3 do 30 znaków")
        if(data.oldPassword === data.password) throw ("Nowe hasło nie może być takie samo jak stare")
        if(utils.checkSymbols(data.password, "nick") === false) throw ("Hasło zawiera nieprawidłowe znaki")
        if(data.oldPassword !== user.password) throw ("Stare hasło jest nieprawidłowe")
        newPassword = true
      }

      return await models.User.findOneAndUpdate(
          { username: data.username },
          { password: newPassword === true ? data.password : user.password,
          weatherCity: data.weatherCity ? data.weatherCity : user.weatherCity },
          { new: true }
      )
  } catch (error) {
      constants.DEBUG_MODE === true && console.log(`[${updateUser.name}] ${error}`)
      return { error: error }
  }
}

// KASOWANIE UŻYTKOWNIKA PO NAZWIE
const deleteUser = async (data) => {
  try {
      if(!data.username) throw ("Nie podano nazwy użytkownika")

      let user = await models.User.findOne({ username: data.username })
      if (!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

      return await user.remove()
  } catch (error) {
      constants.DEBUG_MODE === true && console.log(`[${deleteUser.name}] ${error}`)
      return { error: error }
  }
}

//TWORZENIE NOTATKI
const createNote = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    if(!data.title) throw ("Nie podano tytułu notatki")
    if(data.title.length > 30) throw ("Tytuł notatki może mieć maksymalnie 30 znaków")
    if(!data.content) throw ("Nie podano treści notatki")
    if(data.content.length > 1000) throw ("Treść notatki może mieć maksymalnie 1000 znaków")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)
    user.password

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          $push: { notes: {
            id: uuidv4(),
            title: data.title,
            content: data.content,
            createdAt: new Date,
            updatedAt: new Date
          } },
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${createNote.name}] ${error}`)
    return { error: error }
  }
}

//EDYCJA NOTATKI
const editNote = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    if(!data.title) throw ("Nie podano tytułu notatki")
    if(data.title.length > 30) throw ("Tytuł notatki może mieć maksymalnie 30 znaków")
    if(!data.content) throw ("Nie podano treści notatki")
    if(data.content.length > 1000) throw ("Treść notatki może mieć maksymalnie 1000 znaków")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(!data.id) throw ("Nie podano notatki")
    let findNote = user.notes.findIndex(el => el.id === data.id)
    if(findNote === -1) throw ("Nie znaleziono notatki")

    user.notes[findNote] = {
      id: user.notes[findNote].id,
      title: data.title,
      content: data.content,
      createdAt: user.notes[findNote].createdAt,
      updatedAt: new Date
    }

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          notes: user.notes,
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${editNote.name}] ${error}`)
    return { error: error }
  }
}

//USUWANIE NOTATKI
const deleteNote = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(!data.id) throw ("Nie podano notatki")
    let findNote = user.notes.findIndex(el => el.id === data.id)
    if(findNote === -1) throw ("Nie znaleziono notatki")

    user.notes = user.notes.filter(el => el.id !== data.id)

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          notes: user.notes,
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${deleteNote.name}] ${error}`)
    return { error: error }
  }
}

//TWORZENIE KONTAKTU
const createContact = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    if(!data.name) throw ("Nie podano nazwy nowego kontaktu")
    if(data.name.length > 40) throw ("Nazwa nowego kontaktu może mieć maksymalnie 40 znaków")

    if(data.phone) {
      if(data.phone.length != 9) throw ("Długość numeru telefonu musi wynosić 9")
      if(isNaN(data.phone)) throw ("Format numeru telefonu jest nieprawidłowy")
    }

    if(data.email) {
      if(data.email.length > 100) throw ("Adres e-mail nowego kontaktu może mieć maksymalnie 100 znaków")
      if(data.email.indexOf('@') === -1) throw ("Format adresu e-mail nowego kontaktu jest nieprawidłowy")
    }

    if(data.comment) {
      if(data.comment.length > 1000) throw ("Komentarz kontaktu może mieć maksymalnie 1000 znaków")
    }

    if(data.instagram) {
      if(data.instagram.length > 200) throw ("Adres konta instagram nowego kontaktu może mieć maksymalnie 200 znaków")
    }

    if(data.facebook) {
      if(data.facebook.length > 200) throw ("Adres konta facebook nowego kontaktu może mieć maksymalnie 200 znaków")
    }

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          $push: { contacts: {
            id: uuidv4(),
            name: data.name,
            phone: data.phone ? parseInt(data.phone) : null,
            email: data.email ? data.email : null,
            debt: [],
            comment: data.comment ? data.comment : null,
            instagramLink: data.instagram ? data.instagram : null,
            facebookLink: data.facebook ? data.facebook : null,
            createdAt: new Date,
            updatedAt: new Date
          } },
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${createContact.name}] ${error}`)
    return { error: error }
  }
}

//EDYCJA KONTAKTU
const editContact = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    if(!data.name) throw ("Nie podano nazwy kontaktu")
    if(data.name.length > 40) throw ("Nazwa kontaktu może mieć maksymalnie 40 znaków")

    if(data.phone) {
      if(data.phone.length != 9) throw ("Długość numeru telefonu musi wynosić 9")
      if(isNaN(data.phone)) throw ("Format numeru telefonu jest nieprawidłowy")
    }

    if(data.email) {
      if(data.email.length > 100) throw ("Adres e-mail kontaktu może mieć maksymalnie 100 znaków")
      if(data.email.indexOf('@') === -1) throw ("Format adresu e-mail kontaktu jest nieprawidłowy")
    }

    if(data.comment) {
      if(data.comment.length > 1000) throw ("Komentarz kontaktu może mieć maksymalnie 1000 znaków")
    }

    if(data.instagram) {
      if(data.instagram.length > 200) throw ("Adres konta instagram kontaktu może mieć maksymalnie 200 znaków")
    }

    if(data.facebook) {
      if(data.facebook.length > 200) throw ("Adres konta facebook kontaktu może mieć maksymalnie 200 znaków")
    }

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(!data.id) throw ("Nie podano kontaktu")
    let findContact = user.contacts.findIndex(el => el.id === data.id)
    if(findContact === -1) throw ("Nie znaleziono kontaktu")

    user.contacts[findContact] = {
      id: user.contacts[findContact].id,
      name: data.name,
      phone: data.phone ? parseInt(data.phone) : null,
      email: data.email ? data.email : null,
      debt: user.contacts[findContact].debt,
      comment: data.comment ? data.comment : null,
      instagramLink: data.instagram ? data.instagram : null,
      facebookLink: data.facebook ? data.facebook : null,
      createdAt: user.contacts[findContact].createdAt,
      updatedAt: new Date
    }

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          contacts: user.contacts,
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${editContact.name}] ${error}`)
    return { error: error }
  }
}

//USUWANIE KONTAKTU
const deleteContact = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(!data.id) throw ("Nie podano kontaktu")
    let findContact = user.contacts.findIndex(el => el.id === data.id)
    if(findContact === -1) throw ("Nie znaleziono kontaktu")

    user.contacts = user.contacts.filter(el => el.id !== data.id)

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          contacts: user.contacts,
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${deleteContact.name}] ${error}`)
    return { error: error }
  }
}

//TWORZENIE WYDARZENIA
const createEvent = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    if(!data.title) throw ("Nie podano tytułu wydarzenia")
    if(data.title.length > 30) throw ("Nazwa nowego wydarzenia może mieć maksymalnie 30 znaków")

    if(data.comment && data.comment.length > 200) throw ("Komentarz kontaktu może mieć maksymalnie 200 znaków")

    if(!data.time) throw ("Nie podano daty lub godziny wydarzenia")

    if(data.time) {
      //Format: YYYY-MM-DD HH:MM
      if(new Date(data.time).toString() === 'Invalid Date') throw ("Format daty jest nieprawidłowy")
      if(new Date(data.time) - new Date < 0) throw ("Nie można dodawać wydarzeń z przeszłą datą")
      if(new Date(data.time) - new Date > 63072000000) throw ("Nie można dodawać wydarzeń z ponad 2-letnim wyprzedzeniem")
    }

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          $push: { events: {
            id: uuidv4(),
            title: data.title,
            comment: data.comment ? data.comment : null,
            time: new Date(data.time),
            createdAt: new Date,
            updatedAt: new Date
          } },
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${createEvent.name}] ${error}`)
    return { error: error }
  }
}

//EDYCJA WYDARZENIA
const editEvent = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    if(!data.title) throw ("Nie podano tytułu wydarzenia")
    if(data.title.length > 30) throw ("Nazwa wydarzenia może mieć maksymalnie 30 znaków")

    if(data.comment && data.comment.length > 200) throw ("Komentarz kontaktu może mieć maksymalnie 200 znaków")

    if(!data.time) throw ("Nie podano daty lub godziny wydarzenia")

    if(data.time) {
      //Format: YYYY-MM-DD HH:MM
      if(new Date(data.time).toString() === 'Invalid Date') throw ("Format daty jest nieprawidłowy")
      if(new Date(data.time) - new Date < 0) throw ("Nie można edytować wydarzeń z przeszłą datą")
      if(new Date(data.time) - new Date > 63072000000) throw ("Nie można edytować wydarzeń z ponad 2-letnim wyprzedzeniem")
    }

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(!data.id) throw ("Nie podano wydarzenia")
    let findEvent = user.events.findIndex(el => el.id === data.id)
    if(findEvent === -1) throw ("Nie znaleziono wydarzenia")

    user.events[findEvent] = {
      id: user.events[findEvent].id,
      title: data.title,
      comment: data.comment ? data.comment : null,
      time: new Date(data.time),
      createdAt: user.events[findEvent].createdAt,
      updatedAt: new Date
    }

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          events: user.events,
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${editEvent.name}] ${error}`)
    return { error: error }
  }
}

//USUWANIE WYDARZENIA
const deleteEvent = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(!data.id) throw ("Nie podano wydarzenia")
    let findEvent = user.events.findIndex(el => el.id === data.id)
    if(findEvent === -1) throw ("Nie znaleziono wydarzenia")

    user.events = user.events.filter(el => el.id !== data.id)

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          events: user.events,
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${deleteEvent.name}] ${error}`)
    return { error: error }
  }
}

//TWORZENIE ZADŁUŻENIA
const createDebt = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(!data.id) throw ("Nie podano kontaktu")
    let findContact = user.contacts.findIndex(el => el.id === data.id)

    if(findContact === -1) throw ("Nie znaleziono podanego kontaktu")

    if(!data.my) throw ("Nie podano czyje jest zadłużenie")

    if(!data.count) throw ("Nie podano kwoty zadłużenia")
    if(isNaN(data.count)) throw ("Nieprawidłowy format kwoty zadłużenia")
    if(data.count <= 0) throw ("Kwota zadłużenia nie może być mniejsza bądź równa 0")

    if(data.comment && data.comment.length > 1000) throw ("Komentarz zadłużenia może mieć maksymalnie 1000 znaków")

    if(!data.time) throw ("Nie podano daty lub godziny zadłużenia")

    if(data.time) {
      //Format: YYYY-MM-DD HH:MM
      if(new Date(data.time).toString() === 'Invalid Date') throw ("Format daty jest nieprawidłowy")
    }

    user.contacts[findContact].debt.push({
      id: uuidv4(),
      my: data.my === true ? true : false,
      count: parseInt(data.count),
      comment: data.comment ? data.comment : null,
      time: new Date(data.time),
      createdAt: new Date,
      updatedAt: new Date
    })

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          contacts: user.contacts,
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${createDebt.name}] ${error}`)
    return { error: error }
  }
}

//EDYCJA ZADŁUŻENIA
const editDebt = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(!data.id) throw ("Nie podano kontaktu")
    let findContact = user.contacts.findIndex(el => el.id === data.id)

    if(findContact === -1) throw ("Nie znaleziono podanego kontaktu")

    if(!data.debtId) throw ("Nie podano zadłużenia")
    let findDebt = user.contacts[findContact].debt.findIndex(el => el.id === data.debtId)

    if(findDebt === -1) throw ("Nie znaleziono podanego zadłużenia")

    if(!data.my) throw ("Nie podano czyje jest zadłużenie")

    if(!data.count) throw ("Nie podano kwoty zadłużenia")
    if(isNaN(data.count)) throw ("Nieprawidłowy format kwoty zadłużenia")
    if(data.count <= 0) throw ("Kwota zadłużenia nie może być mniejsza bądź równa 0")

    if(data.comment && data.comment.length > 1000) throw ("Komentarz zadłużenia może mieć maksymalnie 1000 znaków")

    if(!data.time) throw ("Nie podano daty lub godziny zadłużenia")

    if(data.time) {
      //Format: YYYY-MM-DD HH:MM
      if(new Date(data.time).toString() === 'Invalid Date') throw ("Format daty jest nieprawidłowy")
    }

    user.contacts[findContact].debt[findDebt] = {
      id: user.contacts[findContact].debt[findDebt].id,
      my: data.my === true ? true : false,
      count: parseInt(data.count),
      comment: data.comment ? data.comment : null,
      time: new Date(data.time),
      createdAt: user.contacts[findContact].debt[findDebt].createdAt,
      updatedAt: new Date
    }

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          contacts: user.contacts,
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${editDebt.name}] ${error}`)
    return { error: error }
  }
}

//USUWANIE ZADŁUŻENIA
const deleteDebt = async (data) => {
  try {
    if(!data.username) throw ("Nie podano nazwy użytkownika")

    let user = await models.User.findOne({ username: data.username })
    if(!user) throw (`Nie znaleziono użytkownika "${data.username}"`)

    if(!data.id) throw ("Nie podano kontaktu")
    let findContact = user.contacts.findIndex(el => el.id === data.id)

    if(findContact === -1) throw ("Nie znaleziono podanego kontaktu")

    if(!data.debtId) throw ("Nie podano zadłużenia")
    let findDebt = user.contacts[findContact].debt.findIndex(el => el.id === data.debtId)

    if(findDebt === -1) throw ("Nie znaleziono podanego zadłużenia")

    user.contacts[findContact].debt = user.contacts[findContact].debt.filter(el => el.id !== data.debtId)

    return await models.User.findOneAndUpdate(
      { username: data.username },
      {
          contacts: user.contacts,
      },
      { new: true }
    )
  } catch (error) {
    constants.DEBUG_MODE === true && console.log(`[${deleteDebt.name}] ${error}`)
    return { error: error }
  }
}

module.exports = {
  checkLogin,

  getUser,
  newUser,
  updateUser,
  deleteUser,

  createNote,
  editNote,
  deleteNote,

  createContact,
  editContact,
  deleteContact,

  createEvent,
  editEvent,
  deleteEvent,

  createDebt,
  editDebt,
  deleteDebt,
}