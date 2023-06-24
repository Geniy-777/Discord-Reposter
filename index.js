let currentSendingState = false

const request_retry = async ({
  authorization,
  msg,
  url,
  timeout
}) => {
  try {
    if (!currentSendingState)
      throw new Error('Отправка сообщений приостановлена!')
    viewLog('Отправка...')
    await fetch(
        url, {
          method: "POST",
          headers: {
            "authorization": authorization,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(msg),
        })
      .then((res) => {
        console.log(res.status, '\n', res.json())
        if (res.status === 200)
          viewLog('Сообщение успешно отправлено!')
        else if (res.status === 429)
          throw new Error(`Не удалось отправить сообщение, в канале установлен медленный режим, следующая попытка через ${Math.floor(timeout/60000)} минут!`)
        else
          throw new Error('Не удалось отправить сообщение!')
      })
      .catch((err) => viewLog(err))

    await sleep(timeout)
    return await request_retry({
      authorization,
      msg,
      url,
      timeout
    })
  } catch (err) {
    console.warn(err)
    return;
  }
}

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}


const viewLog = (msg) => {
  document.querySelector('#logs').value = document.querySelector('#logs').value.concat(
    '-----------------------------\n',
    msg,
    '\n-----------------------------\n')
}



const startSend = async () => {

  try {
    const msg = {
      // Сообщение для отправки
      content: document.querySelector('.text-area').value,
      tts: false,
      flags: 0
    }
    // КаналID куда отсылать
    const chnID = document.querySelector('.text-item[name="channelID"]').value

    // Токен пользователя
    const authorization = document.querySelector('.text-item[name="authorization"]').value
    // URL API
    const url = `https://discord.com/api/v9/channels/${chnID}/messages`

    document.querySelector('#send').setAttribute('disabled', '')
    currentSendingState = true
    // 30 минут + от 0 до 1 секунды случаная задержка
    const userTimer = Number(document.querySelector('.text-item[name="timeout"]').value)
    let timeout = 0
    if (Number.isNaN(userTimer)) {
      viewLog('Период отправки указан неверно, выставлен дефолтный вариант => 30 минут!')
      timeout = 30 * 60000 + Math.floor(Math.random() * 1001)
    } else {
      timeout = userTimer * 60000 + Math.floor(Math.random() * 1001)
    }

    return request_retry({
      authorization,
      msg,
      url,
      timeout
    })
  } catch (err) {
    viewLog(err + '\nДавай заполни поля правильно, валидация для слабых')
  }
}


const stopSend = () => {
  viewLog('Отправка сообщений остановлена!')
  document.querySelector('#send').removeAttribute('disabled')
  currentSendingState = false
  return;
}

document.addEventListener('DOMContentLoaded', () => {
  // 

  document.querySelector('#header').textContent = String.fromCharCode(...[1058, 1105, 1084, 1099, 1095, 32, 1090, 1086, 1095, 1085, 1086, 32, 1051, 1054, 1061])
  document.querySelector('.text-area').textContent = '**ПРОДАМ\n\n--\n\nЦЕНА : XXX$**'
  document.querySelector('.text-item[name="channelID"]').value = ''
  document.querySelector('.text-item[name="timeout"]').value = '30'
  document.querySelector('.text-item[name="authorization"]').value = ''


  document.getElementById('send').addEventListener('click', startSend)
  document.getElementById('stop').addEventListener('click', stopSend)
  document.getElementById('clear-logs').addEventListener('click', () => {
    document.getElementById('logs').value = ''
  })

  document.querySelector('#header').textContent = 'Артём ЛОХ'
})