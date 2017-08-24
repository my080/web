<template lang="html">
  <div id="editor" ref="editor" v-html="inputContent" @input="outputContent"></div>
</template>

<script>
  import WangEditor from 'wangeditor'
  export default {
    // beforeDestroy: function(){      
    //   gbqModel().commit();
    // },
    props: ['inputContent', 'uploadUrl','vueObj'],
    data() {
      return {
        content: ''
      }
    },
    computed: {

    },
    mounted() {
      this.createEditor()
    },
    methods: {
        createEditor() {
            var vueObj = this.vueObj;
            var token = JSON.parse(sessionStorage.getItem('loginInfoStr')).accesstoken;
            const self = this;
            const editor = new WangEditor('editor');
            // 设置 headers（举例）
            editor.config.uploadImgHeaders = {
                'Accept': 'text/x-json',
                'Content-Type': 'multipart/form-data'
            }
            editor.config.withCredentials = true;
            editor.config.menus = ['source','bold', 'underline', 'italic', 'strikethrough', 'eraser', 'forecolor', 'bgcolor', '|', 'quote', 'fontfamily', 'fontsize', 'head', 'unorderlist', 'orderlist', 'alignleft', 'aligncenter', 'alignright',
            '|', 'link', 'unlink', 'table', 'img', '|', 'undo', 'redo'
            ]
            
            
            //editor.config.uploadImgUrl = this.uploadUrl + '?accesstoken=' + token;
            editor.config.uploadImgUrl = "http://localhost:3000/project/upload/";
            // 将图片大小限制为 5M
            editor.config.uploadImgMaxSize = 5 * 1024 * 1024;
            editor.config.uploadImgMaxLength = 5;
            editor.uploadImgOriginalName = "avatar";
            //自定义load事件
            editor.config.uploadImgFns.onload = function (resultText, xhr) {
              // resultText 服务器端返回的text
              // xhr 是 xmlHttpRequest 对象，IE8、9中不支持
              // 上传图片时，已经将图片的名字存在 editor.uploadImgOriginalName
              
              var originalName = editor.uploadImgOriginalName || '';  
              // 如果 resultText 是图片的url地址，可以这样插入图片：
              editor.command(null, 'insertHtml', '<img src="' + resultText + '" alt="' + originalName + '" style="max-width:100%;"/>');
              // 如果不想要 img 的 max-width 样式，也可以这样插入：
              // editor.command(null, 'InsertImage', resultText);
              vueObj.$message({
                type: 'success',
                message: '插入图片成功!'
              });
            };
            editor.onchange = function() {
              self.formatContent(this.$txt.html())
            }
            editor.create();
            // 初始化编辑器的内容
          },
          formatContent(content) {
            // handle
            this.content = content
            this.outputContent()
          },
          outputContent() {
            this.$emit('input', this.content)
          }
        },
        components: {}
      }
    </script>

    <style>

      

    </style>
