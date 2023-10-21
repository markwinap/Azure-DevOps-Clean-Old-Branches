import 'dotenv/config'
import axios from 'axios';
import dayjs from 'dayjs';
import { Repository, Branch, Commit, UpdateRefsResponse } from "./interfaces";

const userName = process.env.USERNAME || '';
const password = process.env.PASSWORD || '';
const organization = process.env.ORGANIZATION || '';
const project = process.env.PROJECT || '';
const apiVersion = process.env.API_VERSION || '';
const targetRepository = process.env.TARGET_REPOSITORY || '';
const daysOld = process.env.DAYS_OLD || 7;

const main = async () => {

    try {
        // fetch repositories
        const url = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories`;
        const repositories: Repository[] = await axios.get(url, {
            auth: {
                username: userName,
                password: password
            },
            params: {
                api_version: apiVersion
            }
        }).then(res => res.data.value);

        const targetRepositoryId = repositories.find(repository => repository.name === targetRepository)?.id;

        if (!targetRepositoryId) {
            throw new Error(`Repository ${targetRepository} not found.`);
        }

        // fetch branches
        const branchesUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${targetRepositoryId}/refs`;
        const branches : Branch[] = await axios.get(branchesUrl, {
            auth: {
                username: userName,
                password: password
            },
            params: {
                api_version: apiVersion
            }
        }).then(res => res.data.value);

        console.log('Branches found: ', branches.length);

        // fetch commits
        for (const branch of branches) {
            const trimmedBranchName = branch.name.replace('refs/heads/', '');
        
            const commitsUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${targetRepositoryId}/commits`;
            const commits : Commit[] = await axios.get(commitsUrl, {
                auth: {
                    username: userName,
                    password: password
                },
                params: {
                    api_version: apiVersion,
                    searchCriteria: {
                        $top: 1,// only need the last commit
                        itemVersion: {
                            version: trimmedBranchName,
                        }
                    }
                }
            }).then(res => res.data.value);

            const lastCommit = commits[0];
            const lastCommitDate = dayjs(lastCommit.committer.date);
            const isOlderThanDays = lastCommitDate.isBefore(dayjs().subtract(Number(daysOld), 'day'));
            
            console.log('Branch: ', trimmedBranchName, ' - Last Commit Date: ', lastCommitDate.format('YYYY-MM-DD HH:mm:ss'));

            // delete branch
            if (isOlderThanDays) {
                const data = [{
                    name: branch.name,
                    oldObjectId: branch.objectId,
                    newObjectId: '0000000000000000000000000000000000000000'
                }];
                const deleteBranchUrl = `https://dev.azure.com/${organization}/${project}/_apis/git/repositories/${targetRepositoryId}/refs?api-version=${apiVersion}`;
                const deleteBranchResponse : UpdateRefsResponse[] = await axios({
                    method: 'post',
                    url: deleteBranchUrl,
                    auth: {
                        username: userName,
                        password: password
                    },
                    data
                }).then(res => res.data.value);

                const [{ success }] = deleteBranchResponse;
                if (success) {
                    console.log('Branch deleted: ', trimmedBranchName);   
                }
            }
        }
    } catch (error: any) {
        console.error(error);
    }
}
main();