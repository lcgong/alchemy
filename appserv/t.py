# function hash (str) {
#   return crypto
#     .createHash('sha1')
#     .update(str, 'ascii')
#     .digest('base64')
#     .replace(PLUS_GLOBAL_REGEXP, '-')
#     .replace(SLASH_GLOBAL_REGEXP, '_')
#     .replace(EQUAL_GLOBAL_REGEXP, '')
# # }
# salt + '-' + hash(salt + '-' + secret)

secure = 'DjwennlKciQiTlxKmYtWqH8NG7Lnf7Y8vDcyjxlg'
token = 'X1KfgR1J-OgSnojv73LpcSlOZ_AcX0Pv3H2A'

verifyCRSFToken(token, secure)

# salt + '-' + 

# token[0, token.indexOf('-')]

