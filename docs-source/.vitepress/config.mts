import { defineConfig } from 'vitepress'
import { resolve } from 'path'

export default defineConfig({
  title: 'NCMAutoDaily',
  description: '网易云音乐自动打卡项目 - 自动完成每日签到、黑胶乐签、云贝签到和听歌打卡',
  outDir: resolve(__dirname, '../../docs'),
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'NCMAutoDaily',

    nav: [
      { text: '首页', link: '/' },
      {
        text: '指南',
        items: [
          { text: '安装指南', link: '/guide/install' },
          { text: '快速开始', link: '/guide/quick-start' },
          { text: '配置说明', link: '/guide/configuration' },
          { text: 'Vercel部署', link: '/guide/vercel' }
        ]
      },
      { text: 'API', link: '/api/' },
      { text: 'FAQ', link: '/guide/faq' }
    ],

    sidebar: {
      '/': [
        {
          text: '指南',
          items: [
            { text: '安装指南', link: '/guide/install' },
            { text: '快速开始', link: '/guide/quick-start' },
            { text: '配置说明', link: '/guide/configuration' },
            { text: 'Vercel部署', link: '/guide/vercel' },
            { text: '常见问题', link: '/guide/faq' }
          ]
        },
        {
          text: 'API 接口',
          items: [
            { text: '接口概览', link: '/api/' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NeteaseCloudMusicApiEnhanced/NCMAutoDaily' }
    ],

    footer: {
      message: 'Released under the AGPL-3.0 License.',
      copyright: 'Copyright © 2024-present NCMAutoDaily'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '目录'
    }
  },

  markdown: {
    lineNumbers: true
  }
})