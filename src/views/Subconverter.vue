<template>
  <div>
    <el-row style="margin-top: 10px">
      <el-col>
        <el-card>
          <div slot="header">
            訂閱轉換
            <svg-icon icon-class="github" style="margin-left: 20px" @click="goToProject" />

            <div style="display: inline-block; position:absolute; right: 20px">{{ backendVersion }}</div>
          </div>
          <el-container>
            <el-form :model="form" label-width="80px" label-position="left" style="width: 100%">
              <el-form-item label="模式設置:">
                <el-radio v-model="advanced" label="1">簡易模式</el-radio>
                <el-radio v-model="advanced" label="2">高級模式</el-radio>
              </el-form-item>
              <el-form-item label="訂閱連結:">
                <el-input
                  v-model="form.sourceSubUrl"
                  type="textarea"
                  rows="3"
                  placeholder="支援訂閱或ss/ssr/vmess/trojan等連結，多個連結每行一個或用 | 分隔"
                  @blur="saveSubUrl"
                />
              </el-form-item>
              <el-form-item label="客戶端:">
                <el-select v-model="form.clientType" style="width: 100%">
                  <el-option v-for="(v, k) in options.clientTypes" :key="k" :label="k" :value="v"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="後端地址:">
                  <el-autocomplete
                    style="width: 100%"
                    v-model="form.customBackend"
                    :fetch-suggestions="backendSearch"
                    placeholder="選擇或輸入您的後端地址"
                  >
                    <!-- <el-button slot="append" @click="gotoGayhub" icon="el-icon-link">前往项目仓库</el-button> -->
                  </el-autocomplete>
                </el-form-item>

              <div v-if="advanced === '2'">
                <el-form-item label="遠程配置:">
                  <el-select
                    v-model="form.remoteConfig"
                    allow-create
                    filterable
                    placeholder="請選取"
                    style="width: 100%"
                  >
                    <el-option-group
                      v-for="group in options.remoteConfig"
                      :key="group.label"
                      :label="group.label"
                    >
                      <el-option
                        v-for="item in group.options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-option-group>
                    <el-button slot="append" @click="gotoRemoteConfig" icon="el-icon-link">配置示例</el-button>
                  </el-select>
                </el-form-item>
                <el-form-item label="包含節點:">
                  <el-input v-model="form.includeRemarks" placeholder="節點名包含的關鍵字，支援正則" />
                </el-form-item>
                <el-form-item label="排除節點:">
                  <el-input v-model="form.excludeRemarks" placeholder="節點名不包含的關鍵字，支援正則" />
                </el-form-item>
                <el-form-item label="文件名稱:">
                  <el-input v-model="form.filename" placeholder="返回的訂閱文件名" />
                </el-form-item>
                <el-form-item label-width="0px">
                  <el-row type="flex">
                    <el-col>
                      <el-checkbox v-model="form.nodeList" label="輸出為節點列" border></el-checkbox>
                    </el-col>
                    <el-popover placement="bottom" v-model="form.extraset">
                      <el-row>
                        <el-checkbox v-model="form.emoji" label="Emoji"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.udp" @change="needUdp = true" label="啟用 UDP(需伺服器支援)"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.scv" label="跳過證書驗證"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.appendType" label="節點類型"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.sort" label="排序節點"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.fdn" label="過濾非法節點"></el-checkbox>
                      </el-row>
                      <el-button slot="reference">更多選項</el-button>
                    </el-popover>
                    <el-popover placement="bottom" style="margin-left: 10px">
                      <el-row>
                        <el-checkbox v-model="form.tpl.surge.doh" label="Surge.DoH"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.tpl.clash.doh" label="Clash.DoH"></el-checkbox>
                      </el-row>
                      <el-row>
                        <el-checkbox v-model="form.insert" label="網易雲"></el-checkbox>
                      </el-row>
                      <el-button slot="reference">訂製功能</el-button>
                    </el-popover>
                  </el-row>
                </el-form-item>
              </div>

              <div style="margin-top: 50px"></div>

              <el-divider content-position="center">
                <i class="el-icon-magic-stick"></i>
              </el-divider>

              <el-form-item label="訂製訂閱:">
                <el-input class="copy-content" disabled v-model="customSubUrl">
                  <el-button
                    slot="append"
                    v-clipboard:copy="customSubUrl"
                    v-clipboard:success="onCopy"
                    ref="copy-btn"
                    icon="el-icon-document-copy"
                  >複製</el-button>
                </el-input>
              </el-form-item>
              <el-form-item label="訂閱短連:">
                <el-input class="copy-content" disabled v-model="curtomShortSubUrl">
                  <el-button
                    slot="append"
                    v-clipboard:copy="curtomShortSubUrl"
                    v-clipboard:success="onCopy"
                    ref="copy-btn"
                    icon="el-icon-document-copy"
                  >複製</el-button>
                </el-input>
              </el-form-item>

              <el-form-item label-width="0px" style="margin-top: 40px; text-align: center">
                <el-button
                  style="width: 120px"
                  type="danger"
                  @click="makeUrl"
                  :disabled="form.sourceSubUrl.length === 0"
                >生成訂閱連結</el-button>
                <el-button
                  style="width: 120px"
                  type="danger"
                  @click="makeShortUrl"
                  :loading="loading"
                  :disabled="customSubUrl.length === 0"
                >生成訂閱短連結</el-button>
              </el-form-item>

              <el-form-item label-width="0px" style="text-align: center">
                <el-button
                  style="width: 120px"
                  type="primary"
                  @click="dialogUploadConfigVisible = true"
                  icon="el-icon-upload"
                  :loading="loading"
                >上載配置</el-button>
                <el-button
                    style="width: 120px"
                    type="primary"
                    @click="dialogLoadConfigVisible = true"
                    icon="el-icon-copy-document"
                    :loading="loading"
                >从URL解析</el-button>
              </el-form-item>
              <el-form-item label-width="0px" style="text-align: center">
                <el-button
                  style="width: 120px"
                  type="primary"
                  @click="clashInstall"
                  icon="el-icon-connection"
                  :disabled="customSubUrl.length === 0"
                >一鍵導入Clash</el-button>
                <el-button
                style="width: 120px"
                type="primary"
                @click="surgeInstall"
                icon="el-icon-connection"
                :disabled="customSubUrl.length === 0"
                >一鍵導入Surge</el-button>
              </el-form-item>
            </el-form>
          </el-container>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      :visible.sync="dialogUploadConfigVisible"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="700px"
    >
      <div slot="title">
        遠程配置上載
        <el-popover trigger="hover" placement="right" style="margin-left: 10px">
          <el-link type="primary" :href="sampleConfig" target="_blank" icon="el-icon-info">參考配置</el-link>
          <i class="el-icon-question" slot="reference"></i>
        </el-popover>
      </div>
      <el-form label-position="left">
        <el-form-item prop="uploadConfig">
          <el-input
            v-model="uploadConfig"
            type="textarea"
            :autosize="{ minRows: 15, maxRows: 15}"
            maxlength="5000"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadConfig = ''; dialogUploadConfigVisible = false">取 消</el-button>
        <el-button
          type="primary"
          @click="confirmUploadConfig"
          :disabled="uploadConfig.length === 0"
        >確 定</el-button>
      </div>
    </el-dialog>

    <el-dialog
        :visible.sync="dialogLoadConfigVisible"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        width="700px"
    >
      <div slot="title">
        可以從老的訂閱信息中解析信息,填入頁面中去
      </div>
      <el-form label-position="left">
        <el-form-item prop="uploadConfig">
          <el-input
              v-model="loadConfig"
              type="textarea"
              :autosize="{ minRows: 15, maxRows: 15}"
              maxlength="5000"
              show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="loadConfig = ''; dialogLoadConfigVisible = false">取 消</el-button>
        <el-button
            type="primary"
            @click="confirmLoadConfig"
            :disabled="loadConfig.length === 0"
        >確 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
const project = process.env.VUE_APP_PROJECT
const remoteConfigSample = process.env.VUE_APP_SUBCONVERTER_REMOTE_CONFIG
const gayhubRelease = process.env.VUE_APP_BACKEND_RELEASE
const defaultBackend = process.env.VUE_APP_SUBCONVERTER_DEFAULT_BACKEND + '/sub?'
const shortUrlBackend = process.env.VUE_APP_MYURLS_DEFAULT_BACKEND + '/short'
const configUploadBackend = process.env.VUE_APP_CONFIG_UPLOAD_BACKEND + '/config/upload'
const tgBotLink = process.env.VUE_APP_BOT_LINK

export default {
  data() {
    return {
      backendVersion: "",
      advanced: "1",

      // 是否为 PC 端
      isPC: true,

      options: {
        clientTypes: {
          Clash: "clash",
          Surge3: "surge&ver=3",
          Surge4: "surge&ver=4",
          Quantumult: "quan",
          QuantumultX: "quanx",
          Surfboard: "surfboard",
          Loon: "loon",
          SSAndroid: "sssub",
          V2Ray: "v2ray",
          ss: "ss",
          ssr: "ssr",
          ssd: "ssd",
          ClashR: "clashr",
          Surge2: "surge&ver=2",
        },
        backendOptions: [
          { value: "https://api.wcc.best/sub?" },
          { value: "https://sub.id9.cc/sub?" },
          { value: "https://v.id9.cc/sub?" },
          { value: "https://id9.cc/sub?" },
          { value: "https://api.tsutsu.one/sub?" },
          { value: "https://sub.xeton.dev/sub?" },
          { value: "https://api.dler.io/sub?" },
          { value: "http://127.0.0.1:25500/sub?" }
         ],
        remoteConfig: [
          {
            label: "默認",
            options: [
              {
                label: "不選，由接口提供方提供",
                value:
                  ""
              }
            ]
          },
          {
            label: "ACL4SSR",
            options: [
              {
                label: "ACL4SSR 本地 默認版 分組比較全",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR.ini"
              },
              {
                label: "ACL4SSR_AdblockPlus 本地 更多去廣告",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_AdblockPlus.ini"
              },
              {
                label: "ACL4SSR_BackCN 本地 回國",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_BackCN.ini"
              },
              {
                label: "ACL4SSR_Mini 本地 精簡版",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Mini.ini"
              },
              {
                label: "ACL4SSR_Mini_Fallback 本地 精簡版 帶故障轉移",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Mini_Fallback.ini"
              },
              {
                label: "ACL4SSR_Mini_MultiMode 本地 精簡版 自動測速、故障轉移、負載均衡",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Mini_MultiMode.ini"
              },
              {
                label: "ACL4SSR_Mini_NoAuto 本地 精簡版 不帶自動測速",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Mini_NoAuto.ini"
              },
              {
                label: "ACL4SSR_NoApple 本地 無蘋果分流",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_NoApple.ini"
              },
              {
                label: "ACL4SSR_NoAuto 本地 無自動測速",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_NoAuto.ini"
              },
              {
                label: "ACL4SSR_NoAuto_NoApple 本地 無自動測速&無蘋果分流",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_NoAuto_NoApple.ini"
              },
              {
                label: "ACL4SSR_NoAuto_NoApple_NoMicrosoft 本地 無自動測速&無蘋果分流&無微軟分流",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_NoAuto_NoApple_NoMicrosoft.ini"
              },
              {
                label: "ACL4SSR_NoMicrosoft 本地 無微軟分流",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_NoMicrosoft.ini"
              },
              {
                label: "ACL4SSR_Online 默認版 分組比較全",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"
              },
              {
                label: "ACL4SSR_Online_AdblockPlus 更多去廣告",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_AdblockPlus.ini"
              },
              {
                label: "ACL4SSR_Online_Full 全分組 重度用戶使用",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini"
              },
              {
                label: "ACL4SSR_Online_Full_AdblockPlus 全分組 重度用戶使用 更多去廣告",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_AdblockPlus.ini"
              },
              {
                label: "ACL4SSR_Online_Full_Google 全分組 重度用戶使用 谷歌精細分流",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Google.ini"
              },
              {
                label: "ACL4SSR_Online_Full_MultiMode 全分組 多模式 重度用戶使用",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"
              },
              {
                label: "ACL4SSR_Online_Full_Netflix 全分組 重度用戶使用 奈飛全量",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Netflix.ini"
              },
              {
                label: "ACL4SSR_Online_Full_NoAuto 全分組 無自動測速 重度用戶使用",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_NoAuto.ini"
              },
              {
                label: "ACL4SSR_Online_Mini 精簡版",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini.ini"
              },
              {
                label: "ACL4SSR_Online_Mini_AdblockPlus 精簡版 更多去廣告",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_AdblockPlus.ini"
              },
              {
                label: "ACL4SSR_Online_Mini_Fallback 精簡版 帶故障轉移",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_Fallback.ini"
              },
              {
                label: "ACL4SSR_Online_Mini_MultiCountry 精簡版 帶港美日國家",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiCountry.ini"
              },
              {
                label: "ACL4SSR_Online_Mini_MultiMode 精簡版 自動測速、故障轉移、負載均衡",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiMode.ini"
              },
              {
                label: "ACL4SSR_Online_NoAuto 無自動測速",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoAuto.ini"
              },
              {
                label: "ACL4SSR_Online_NoReject 無攔截",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoReject.ini"
              },
              {
                label: "ACL4SSR_WithChinaIp 本地 增強的中國IP段",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_WithChinaIp.ini"
              },
              {
                label: "ACL4SSR_WithChinaIp_WithGFW 本地 增強的中國IP段 GFW列表",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_WithChinaIp_WithGFW.ini"
              },
              {
                label: "ACL4SSR_WithGFW 本地 GFW列表",
                value:
                  "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_WithGFW.ini"
              }
            ]
          },
          {
            label: "universal",
            options: [
              {
                label: "No-Urltest",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/universal/no-urltest.ini"
              },
              {
                label: "Urltest",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/universal/urltest.ini"
              }
            ]
          },
          {
            label: "customized",
            options: [
              {
                label: "Maying",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/maying.ini"
              },
              {
                label: "Ytoo",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/ytoo.ini"
              },
              {
                label: "FlowerCloud",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/flowercloud.ini"
              },
              {
                label: "Nexitally",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/nexitally.ini"
              },
              {
                label: "SoCloud",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/socloud.ini"
              },
              {
                label: "ARK",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/ark.ini"
              },
              {
                label: "ssrCloud",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/customized/ssrcloud.ini"
              }
            ]
          },
          {
            label: "Special",
            options: [
              {
                label: "NeteaseUnblock(僅規則，No-Urltest)",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/special/netease.ini"
              },
              {
                label: "Basic(仅GEOIP CN + Final)",
                value:
                  "https://cdn.jsdelivr.net/gh/SleepyHeeead/subconverter-config@master/remote-config/special/basic.ini"
              }
            ]
          }
        ]
      },
      form: {
        sourceSubUrl: "",
        clientType: "",
        customBackend: "",
        remoteConfig: "",
        excludeRemarks: "",
        includeRemarks: "",
        filename: "",
        emoji: true,
        nodeList: false,
        extraset: false,
        sort: false,
        udp: true,
        tfo: false,
        scv: false,
        fdn: false,
        appendType: false,
        insert: false, // 是否插入默认订阅的节点，对应配置项 insert_url
        new_name: true, // 是否使用 Clash 新字段

        // tpl 定制功能
        tpl: {
          surge: {
            doh: false // dns 查询是否使用 DoH
          },
          clash: {
            doh: false
          }
        }
      },

      loading: false,
      customSubUrl: "",
      curtomShortSubUrl: "",

      dialogUploadConfigVisible: false,
      loadConfig: "",
      dialogLoadConfigVisible: false,
      uploadConfig: "",
      uploadPassword: "",
      myBot: tgBotLink,
      sampleConfig: remoteConfigSample,

      needUdp: false, // 是否需要添加 udp 参数
    };
  },
  created() {
    document.title = "訂閱轉換";
    // 站点标题萌化
    window.onfocus = function () {
      document.title = '歡迎回來！';
    };
    window.onblur = function () {
      document.title = '快回來~頁面崩潰了';
    };
    this.isPC = this.$getOS().isPc;

    // 获取 url cache
    if (process.env.VUE_APP_USE_STORAGE === 'true') {
      this.form.sourceSubUrl = this.getLocalStorageItem('sourceSubUrl')
    }
  },
  mounted() {
    this.form.clientType = "clash";
    this.notify();
    this.getBackendVersion();
  },
  methods: {
    onCopy() {
      this.$message.success("Copied!");
    },
    goToProject() {
      window.open(project);
    },
    gotoGayhub() {
      window.open(gayhubRelease);
    },
    gotoRemoteConfig() {
      window.open(remoteConfigSample);
    },
    clashInstall() {
      if (this.customSubUrl === "") {
        this.$message.error("請先填寫必填項，生成訂閱鏈接");
        return false;
      }

      const url = "clash://install-config?url=";
      window.open(
        url +
          encodeURIComponent(
            this.curtomShortSubUrl !== ""
              ? this.curtomShortSubUrl
              : this.customSubUrl
          )
      );
    },
    surgeInstall() {
      if (this.customSubUrl === "") {
        this.$message.error("請先填寫必填項，生成訂閱鏈接");
        return false;
      }

      const url = "surge://install-config?url=";
      window.open(url + this.customSubUrl);
    },
    makeUrl() {
      if (this.form.sourceSubUrl === "" || this.form.clientType === "") {
        this.$message.error("訂閱鏈接與客戶端為必填項");
        return false;
      }

      let backend =
        this.form.customBackend === ""
          ? defaultBackend
          : this.form.customBackend;

      let sourceSub = this.form.sourceSubUrl;
      sourceSub = sourceSub.replace(/(\n|\r|\n\r)/g, "|");

      this.customSubUrl =
        backend +
        "target=" +
        this.form.clientType +
        "&url=" +
        encodeURIComponent(sourceSub) +
        "&insert=" +
        this.form.insert;

      if (this.advanced === "2") {
        if (this.form.remoteConfig !== "") {
          this.customSubUrl +=
            "&config=" + encodeURIComponent(this.form.remoteConfig);
        }
        if (this.form.excludeRemarks !== "") {
          this.customSubUrl +=
            "&exclude=" + encodeURIComponent(this.form.excludeRemarks);
        }
        if (this.form.includeRemarks !== "") {
          this.customSubUrl +=
            "&include=" + encodeURIComponent(this.form.includeRemarks);
        }
        if (this.form.filename !== "") {
          this.customSubUrl +=
            "&filename=" + encodeURIComponent(this.form.filename);
        }
        if (this.form.appendType) {
          this.customSubUrl +=
            "&append_type=" + this.form.appendType.toString();
        }

        this.customSubUrl +=
          "&emoji=" +
          this.form.emoji.toString() +
          "&list=" +
          this.form.nodeList.toString() +
          "&tfo=" +
          this.form.tfo.toString() +
          "&scv=" +
          this.form.scv.toString() +
          "&fdn=" +
          this.form.fdn.toString() +
          "&sort=" +
          this.form.sort.toString();

        if (this.needUdp) {
          this.customSubUrl += "&udp=" + this.form.udp.toString()
        }

        if (this.form.tpl.surge.doh === true) {
          this.customSubUrl += "&surge.doh=true";
        }

        if (this.form.clientType === "clash") {
          if (this.form.tpl.clash.doh === true) {
            this.customSubUrl += "&clash.doh=true";
          }

          this.customSubUrl += "&new_name=" + this.form.new_name.toString();
        }
      }

      this.$copyText(this.customSubUrl);
      this.$message.success("定制訂閱已複製到剪貼板");
    },
    makeShortUrl() {
      if (this.customSubUrl === "") {
        this.$message.warning("請先生成訂閱鏈接，再獲取對應短鏈接");
        return false;
      }

      this.loading = true;

      let data = new FormData();
      data.append("longUrl", btoa(this.customSubUrl));

      this.$axios
        .post(shortUrlBackend, data, {
          header: {
            "Content-Type": "application/form-data; charset=utf-8"
          }
        })
        .then(res => {
          if (res.data.Code === 1 && res.data.ShortUrl !== "") {
            this.curtomShortSubUrl = res.data.ShortUrl;
            this.$copyText(res.data.ShortUrl);
            this.$message.success("短鏈接已複製到剪貼板");
          } else {
            this.$message.error("短鏈接獲取失敗：" + res.data.Message);
          }
        })
        .catch(() => {
          this.$message.error("短鏈接獲取失敗");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    notify() {
      const h = this.$createElement;

      this.$notify({
        title: "隱私提示",
        type: "warning",
        message: h(
          "i",
          { style: "color: teal" },
          "各種訂閱鏈接（短鏈接服務除外）生成純前端實現，無隱私問題。默認提供後端轉換服務，隱私擔憂者請自行搭建後端服務。"
        )
      });
    },
    confirmUploadConfig() {
      if (this.uploadConfig === "") {
        this.$message.warning("遠程配置不能為空");
        return false;
      }

      this.loading = true;

      let data = new FormData();
      data.append("password", this.uploadPassword);
      data.append("config", this.uploadConfig);

      this.$axios
        .post(configUploadBackend, data, {
          header: {
            "Content-Type": "application/form-data; charset=utf-8"
          }
        })
        .then(res => {
          if (res.data.code === 0 && res.data.data.url !== "") {
            this.$message.success(
              "遠程配置上傳成功，配置鏈接已複製到剪貼板，有效期三個月望知悉"
            );

            // 自动填充至『表单-远程配置』
            this.form.remoteConfig = res.data.data.url;
            this.$copyText(this.form.remoteConfig);

            this.dialogUploadConfigVisible = false;
          } else {
            this.$message.error("遠程配置上傳失敗: " + res.data.msg);
          }
        })
        .catch(() => {
          this.$message.error("遠程配置上傳失敗");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    confirmLoadConfig(){
      // 怎么解析短链接的302和301...
      if (this.loadConfig.indexOf("target")=== -1){
        this.$message.error("請輸入正確的訂閱地址,暫不支援短鏈接!");
        return;
      }
      let url
      try {
        url = new URL(this.loadConfig)
      } catch (error) {
        this.$message.error("請輸入正確的訂閱地址!");
        return;
      }
      this.form.customBackend = url.origin + url.pathname + "?"
      let param = new URLSearchParams(url.search);
      if (param.get("target")){
        let target = param.get("target");
        if (target === 'surge' && param.get("ver")) {
          // 类型为surge,有ver
          this.form.clientType = target+"&ver="+param.get("ver");
        } else if (target === 'surge'){
          //类型为surge,没有ver
          this.form.clientType = target+"&ver=4"
        } else {
          //类型为其他
          this.form.clientType = target;
        }
      }
      if (param.get("url")){
        this.form.sourceSubUrl = param.get("url");
      }
      if (param.get("insert")){
        this.form.insert = param.get("insert") === 'true';
      }
      if (param.get("config")){
        this.form.remoteConfig = param.get("config");
      }
      if (param.get("exclude")){
        this.form.excludeRemarks = param.get("exclude");
      }
      if (param.get("include")){
        this.form.includeRemarks = param.get("include");
      }
      if (param.get("filename")){
        this.form.filename = param.get("filename");
      }
      if (param.get("append_type")){
        this.form.appendType = param.get("append_type") === 'true';
      }
      if (param.get("emoji")){
        this.form.emoji = param.get("emoji") === 'true';
      }
      if (param.get("list")){
        this.form.nodeList = param.get("list") === 'true';
      }
      if (param.get("tfo")){
        this.form.tfo = param.get("tfo") === 'true';
      }
      if (param.get("scv")){
        this.form.scv = param.get("scv") === 'true';
      }
      if (param.get("fdn")){
        this.form.fdn = param.get("fdn") === 'true';
      }
      if (param.get("sort")){
        this.form.sort = param.get("sort") === 'true';
      }
      if (param.get("udp")){
        this.form.udp = param.get("udp") === 'true';
      }
      if (param.get("surge.doh")){
        this.form.tpl.surge.doh = param.get("surge.doh") === 'true';
      }
      if (param.get("clash.doh")){
        this.form.tpl.clash.doh = param.get("clash.doh") === 'true';
      }
      if (param.get("new_name")){
        this.form.new_name = param.get("new_name") === 'true';
      }
      this.dialogLoadConfigVisible = false;
    },
    backendSearch(queryString, cb) {
      let backends = this.options.backendOptions;

      let results = queryString
        ? backends.filter(this.createFilter(queryString))
        : backends;

      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    createFilter(queryString) {
      return candidate => {
        return (
          candidate.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
        );
      };
    },
    getBackendVersion() {
      this.$axios
        .get(
          defaultBackend.substring(0, defaultBackend.length - 5) + "/version"
        )
        .then(res => {
          this.backendVersion = res.data.replace(/backend\n$/gm, "");
          this.backendVersion = this.backendVersion.replace("subconverter", "");
        });
    },
    saveSubUrl() {
      if (this.form.sourceSubUrl !== '') {
        this.setLocalStorageItem('sourceSubUrl', this.form.sourceSubUrl)
      }
    },
    getLocalStorageItem(itemKey) {
      const now = +new Date()
      let ls = localStorage.getItem(itemKey)

      let itemValue = ''
      if (ls !== null) {
        let data = JSON.parse(ls)
        if (data.expire > now) {
          itemValue = data.value
        } else {
          localStorage.removeItem(itemKey)
        }
      }

      return itemValue
    },
    setLocalStorageItem(itemKey, itemValue) {
      const ttl = process.env.VUE_APP_CACHE_TTL
      const now = +new Date()

      let data = {
        setTime: now,
        ttl: parseInt(ttl),
        expire: now + ttl * 1000,
        value: itemValue
      }
      localStorage.setItem(itemKey, JSON.stringify(data))
    }
  },
};
</script>
