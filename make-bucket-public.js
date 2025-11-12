import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } from '@aws-sdk/client-s3';

async function makeBucketPublic() {
  try {
    console.log('🔧 Configurando bucket MinIO como público...\n');

    // Configuração do cliente S3 para MinIO
    const s3Client = new S3Client({
      endpoint: 'https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'kzNTeGwrChUpHmPn',
        secretAccessKey: 'icrEGiYs4nr21mHP8aIDJi2D4HEXyJHq',
      },
      forcePathStyle: true
    });

    const bucketName = 'seusiteem24h';

    // Política para tornar o bucket público para leitura
    const publicPolicy = {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": "*",
          "Action": ["s3:GetObject"],
          "Resource": [`arn:aws:s3:::${bucketName}/*`]
        }
      ]
    };

    console.log('📋 Política a ser aplicada:');
    console.log(JSON.stringify(publicPolicy, null, 2));
    console.log('');

    // Verificar política atual
    try {
      console.log('🔍 Verificando política atual...');
      const getCurrentPolicy = new GetBucketPolicyCommand({ Bucket: bucketName });
      const currentPolicy = await s3Client.send(getCurrentPolicy);
      console.log('📋 Política atual:', currentPolicy.Policy || 'Nenhuma política definida');
      console.log('');
    } catch (error) {
      console.log('ℹ️ Nenhuma política atual encontrada (isso é normal)');
      console.log('');
    }

    // Aplicar nova política
    console.log('🚀 Aplicando política pública...');
    const putPolicyCommand = new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(publicPolicy)
    });

    await s3Client.send(putPolicyCommand);

    console.log('✅ Bucket configurado como público com sucesso!');
    console.log('');
    console.log('🌐 Agora as URLs funcionarão diretamente:');
    console.log('   https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/...');
    console.log('');
    console.log('🧪 Testando acesso à imagem...');
    
    // Testar uma URL específica
    const testUrl = 'https://minio-rg4c04cc4k4c040ckckkk88c.painel.jotav.me/seusiteem24h/projects/cmhtzq3t90044gdkwh633ig7h/images/6984546e-b5fc-42a9-824a-cddc1ba824ef.png';
    
    try {
      const response = await fetch(testUrl);
      if (response.ok) {
        console.log('✅ Teste de acesso bem-sucedido!');
        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Content-Type: ${response.headers.get('content-type')}`);
      } else {
        console.log(`❌ Teste falhou: ${response.status} ${response.statusText}`);
      }
    } catch (fetchError) {
      console.log('❌ Erro no teste de acesso:', fetchError.message);
    }

  } catch (error) {
    console.error('❌ Erro ao configurar bucket público:', error);
    
    if (error.name === 'NotImplemented') {
      console.log('');
      console.log('⚠️ O MinIO pode não suportar políticas via API.');
      console.log('📋 Configure manualmente via console web:');
      console.log('   1. Acesse: https://console-rg4c04cc4k4c040ckckkk88c.painel.jotav.me');
      console.log('   2. Vá em Buckets → seusiteem24h → Manage → Access Rules');
      console.log('   3. Adicione: Anonymous access com Read permission');
    }
  }
}

makeBucketPublic();