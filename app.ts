import Got from 'got'
import { CronJob } from 'cron'
import * as fs from 'fs'

const WeekMap = {
  1: {
    uri: 'https://javascriptweekly.com',
    title: 'JavaScript Weekly'
  },
  2: {
    uri: 'https://frontendfoc.us',
    title: 'Frontend Focus'
  },
  3: {
    uri: 'https://nodeweekly.com',
    title: 'Node Weekly'
  },
  4: {
    uri: 'https://react.statuscode.com',
    title: 'React Status'
  },
  5: {
    uri: 'https://mobiledevweekly.com',
    title: 'Mobile Developer Weekly'
  },
  6: {
    uri: 'https://golangweekly.com',
    title: 'Golang Weekly'
  },
  7: {
    uri: 'https://rubyweekly.com',
    title: 'Ruby Weekly'
  },
  8: {
    uri: 'https://dbweekly.com',
    title: 'Database Status'
  },
  9: {
    uri: 'https://weekly.statuscode.com',
    title: 'StatusCode Weekly'
  },
  10: {
    uri: 'https://serverless.email',
    title: 'Serverless Status'
  },
  11: {
    uri: 'https://mongodb.email',
    title: 'MongoDB Memo'
  },
  12: {
    uri: 'https://postgresweekly.com',
    title: 'Postgres Weekly'
  },
  // 13: {
  //   uri: 'https://pycoders.com',
  //   title:　'Python Weekly'
  // },
  // 14: {
  //   uri: 'https://news.vuejs.org',
  //   title: 'Vuejs News'
  // },
  // 15: {
  //   uri: 'https://css-weekly.com',
  //   title: 'CSS Weekly'
  // }
}

const request = Got.extend({
  headers: {
    'user-agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
  }
})

const checkWeekly= async (pids: number[]) => {
  const list = Object.keys(WeekMap)
  const myPids = []
  console.log(list)
  for (let i = 0; i < list.length; i++) {
    const uri = WeekMap[i + 1].uri
    const { body } = await request(uri + '/issues/latest')
    const $title = body.match(/<title>([^<]+)<\/title>/)[1]
    const pid = $title.match(/( [\d]+):/)[1].trim()
    console.log($title, pid)
    if (Number(pid) > Number(pids[i])) {
      myPids.push(Number(pid))
      const rssId = body.match(/application\/rss\+xml[^>]+/)[0].split('"')[4]
      console.log(rssId)
      const rssRes = await request(uri + rssId)
      let title = rssRes.body.match(/<title>([^<]+)<\/title>/g)[1]
      title = title.replace(/<[\/]?title>/g, '')
      console.log(title)
      await request(`https://api.leeapps.cn/koa/weekly/fetch?category=${i + 1}&title=${title}`)
    } else {
      myPids.push(Number(pids[i]))
    }
  }
  fs.writeFileSync('./latest.js', myPids)
}

const readLatest = () => {
  fs.readFile('./latest.js', 'utf8', (err, data) => {
    if (!err) {
      console.log(JSON.parse(data))
      checkWeekly(JSON.parse(data))
    }
  })
}

const job = new CronJob('0 0 * * * *', function() {
  console.log('每个小时请求更新');
  readLatest()
}, null, true, 'America/Los_Angeles');
job.start();