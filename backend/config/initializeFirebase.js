var admin = require("firebase-admin");

var serviceAccount ={
    "type": "service_account","project_id": "b-conn-d5f33","private_key_id": "9165e96e1b17277790f7e900a27c3b191232c097","private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC/AddF2+sAGSm+\n65qKEhVO7yAXeNRRyKZnoUAeuqN6gUnRNelJ1eULfBBraAstxhp+GKoK0l+ggG6Q\nYx4JC7LK47c2EPWnF+tyotxXDktbFNjwv26Ri9KgCcQH+NXiUVj1tigZ1NBwXD5H\nZXd15MD1YNqsGUj/6b094zwoh2cyTSEiZ+H+AWI/Zsvyp2Z5/4X76Gp2NIKwkeYW\nKb28yG6Cu9t9zgchyCm4TxLF6IznS2OT1OBxRqDOdDxdbA5VZEKhkPvkhkqMyAOF\nr6UhbOI65sLSjZO/EsycTQ+GUg/MnCzOauxb5SmmR02LTFtS4aQrI7FB6JhqEMn1\nyrwtAEGvAgMBAAECggEAEfw/ZAGYODMmXibbL2MShJM5p1wmSekl2h4x5nLWj+N6\nqutzoxMz9Qfil+p9GvtLZVI3OLuka32Ma6YZnupuFHKqvrmMGAbFkc7KBpx+9f2Z\ni9nKtIPA+nbQ8Zs5sIzOXpyfXAdQ9TOKXbitLfmzPae4D3p2CDrfKeOqt3pAeljk\n8CGCQs4Qo9CnZm5z4FnVxkbMGrFvPEMZ+ZI6KiGGokqYvPBrSSlrIBAgF4PpLlAW\nufvRIdKdCmtZ9ZDEJOC72jkXoyKiM4z+o42pwfzbySLHrb/H6BaMm+wS/wnFVHwJ\nVadbI1/9kMa5vwlmYnmcLrys81hnaIxdEeXIcNE66QKBgQD55+BqKtkL+57g30Dt\nFyxPdkByVEcPw/3ZGwWli/nEcC3u4JbuRNsJ4krHvVkclTYHNfAL4pm4b4of7kc6\nw8Pu4aqeAiASS4whq/PuioBVA9/mf30qM/eTCo4APLSWyQCadiEyflaV+japK9vL\nP3bwaCNVW5JxCOW4vrdtgkde7QKBgQDDqkT+bbb7tZoRsbXyB9yf7eHy1/rkj/ij\n9MkWuU29noNYM8wEQz0tYaSKb7tXgPMX1OPUcqR99kZQqpoyn9GpyjtVHymje/e3\nLo5mP7LF9z3rB4sjJl0IGbQnGEzFNdR+5syzZ7HMrmrj78yZX5+xIkFgwKdukZcG\ngFfIsGCziwKBgD6tdm6KQperyyRROiJ8vmNLoExMcOo2WNN74IWtvr4S+KJB9/jY\nkis/c0v3ZIMztTJHx+XjNnS4nOb3Rywo71pZhQZOOCb+ha3oR6zbVeZ8q0pPTWAp\nWn2plwXeM9jhnuIeoKLeZu8Eq3LwihbG2xjetYXyCp+JALy+MJkppKbdAoGAWodD\nGLzGdrtVJ26jkfHVQCGd8u++41VBYwp0p5DgySS3/G0qraY2ffK5YFvFv/ynfJVB\nPCA2vxjc+6GTamzLYtVwkjey2jMXL6fYtrIuEq4L9dwtofuz+3V5BsWVb4Eyaex7\nNV56wwrH5eIjNasqhZgly5AXZ27xA08KTo5cj3UCgYBvmMVShA4i7XC8/evkoyt4\nt/Ey7npoXiYjhjmvSOvvmoyFDPWwfJvIoVsn8Ar3G1Roi4083esVBQemxLntXvcB\nuwhOINkISW/Wd/RDrkLiaY1XHh+Gl+RVMf0dT4dY+IHqhksib40FUs3fJfkljgka\nq8gEecIUNC8VY36KrhbCHg==\n-----END PRIVATE KEY-----\n","client_email": "firebase-adminsdk-dvvpm@b-conn-d5f33.iam.gserviceaccount.com","client_id": "115284900433260680257","auth_uri": "https://accounts.google.com/o/oauth2/auth","token_uri": "https://oauth2.googleapis.com/token","auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-dvvpm%40b-conn-d5f33.iam.gserviceaccount.com","universe_domain": "googleapis.com"
  };
  const initializeFirebase = () => {
    if (!admin.apps.length) { 
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        });
    } 
  };
  
  module.exports = { initializeFirebase };
